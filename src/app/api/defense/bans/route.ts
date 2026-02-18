
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.teamId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const bans = await db.alert.findMany({
            where: {
                server: { teamId: session.user.teamId },
                type: "IP_BANNED",
                isResolved: false
            },
            include: {
                server: {
                    select: {
                        id: true,
                        name: true,
                        hostname: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(bans.map((b: any) => ({
            id: b.id,
            ip: b.details ? JSON.parse(b.details).ip : "Unknown",
            reason: b.message,
            serverName: b.server.name,
            hostname: b.server.hostname,
            serverId: b.serverId,
            bannedAt: b.createdAt
        })));

    } catch (error) {
        console.error("Defense bans error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.teamId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();

        // Support both single and bulk unban
        // Single: { alertId, serverId, ip }
        // Bulk:   { items: [{ alertId, serverId, ip }, ...] }
        const items: Array<{ alertId: string; serverId: string; ip: string }> =
            body.items ? body.items : [{ alertId: body.alertId, serverId: body.serverId, ip: body.ip }];

        const results: Array<{ ip: string; success: boolean }> = [];

        for (let i = 0; i < items.length; i++) {
            const { alertId, serverId, ip } = items[i];

            try {
                // Create unban command for the agent
                await db.command.create({
                    data: {
                        serverId,
                        type: "UNBAN_IP",
                        payload: JSON.stringify({ ip }),
                        status: "PENDING"
                    }
                });

                // Mark alert as resolved
                if (alertId) {
                    await db.alert.update({
                        where: { id: alertId },
                        data: { isResolved: true }
                    });
                }

                results.push({ ip, success: true });
            } catch (e) {
                results.push({ ip, success: false });
            }
        }

        return NextResponse.json({
            success: true,
            unbanned: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        });

    } catch (error) {
        console.error("Unban error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
