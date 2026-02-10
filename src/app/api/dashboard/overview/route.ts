import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.teamId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const team = await db.team.findUnique({
            where: { id: session.user.teamId },
            select: { aiTokenUsage: true, aiTokenLimit: true }
        });

        const servers = await db.server.findMany({
            where: { teamId: session.user.teamId },
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
            risk: a.type === 'RISK_HIGH' || a.type === 'CPU_HIGH' ? 'HIGH' : 'MEDIUM',
            summary: a.message,
            ip: a.server.ip,
            timestamp: a.createdAt
        }));

        return NextResponse.json({
            servers,
            alerts: formattedAlerts,
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
