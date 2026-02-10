import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendCloudTelegramNotification } from "@/lib/telegram";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.teamId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const team = await db.team.findUnique({
            where: { id: session.user.teamId },
            select: {
                apiKey: true,
                aiTokenUsage: true,
                aiTokenLimit: true,
                telegramToken: true,
                telegramChatId: true
            }
        });

        // --- Stale Agent Detection ---
        const heartbeatThreshold = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
        const staleServers = await db.server.findMany({
            where: {
                teamId: session.user.teamId,
                status: "ONLINE",
                lastSeen: { lt: heartbeatThreshold }
            }
        });

        for (const server of staleServers) {
            // Update to OFFLINE
            await db.server.update({
                where: { id: server.id },
                data: { status: "OFFLINE" }
            });

            // Create Alert
            await db.alert.create({
                data: {
                    serverId: server.id,
                    type: "OFFLINE",
                    message: `Agent ${server.hostname} has disconnected from the cloud.`,
                }
            });

            // Notify Telegram
            if (team?.telegramToken && team?.telegramChatId) {
                await sendCloudTelegramNotification(
                    team.telegramToken,
                    team.telegramChatId,
                    `🚨 *SERVER OFFLINE*: Agent \`${server.hostname}\` has stopped sending heartbeats and is now marked as OFFLINE.`
                );
            }
        }
        // -----------------------------

        const servers = await db.server.findMany({
            where: { teamId: session.user.teamId },
            include: { watchedFiles: true },
            orderBy: { lastSeen: 'desc' },
            take: 20
        });

        const alerts = await db.alert.findMany({
            where: { server: { teamId: session.user.teamId }, isResolved: false },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { server: true }
        });

        // Transform alerts to match UI expectation
        const formattedAlerts = alerts.map((a: any) => ({
            id: a.id,
            risk: a.type === 'RISK_HIGH' || a.type === 'CPU_HIGH' || a.type === 'OFFLINE' ? 'HIGH' : 'MEDIUM',
            summary: a.message,
            ip: a.server.ip,
            timestamp: a.createdAt
        }));

        return NextResponse.json({
            servers,
            alerts: formattedAlerts,
            apiKey: team?.apiKey,
            aiStats: {
                used: team?.aiTokenUsage || 0,
                limit: team?.aiTokenLimit || 50000
            }
        });
    } catch (error) {
        console.error("Dashboard overview error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
