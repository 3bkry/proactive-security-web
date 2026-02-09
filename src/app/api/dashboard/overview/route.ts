
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    // TODO: Add authentication check here (NextAuth/Clerk)
    // For now, returning data for all teams (admin view style) or hardcoded team

    try {
        const servers = await db.server.findMany({
            orderBy: { lastSeen: 'desc' },
            take: 20
        });

        const alerts = await db.alert.findMany({
            where: { isResolved: false },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { server: true } // Include server details in alert
        });

        // Transform alerts to match UI expectation
        const formattedAlerts = alerts.map(a => ({
            id: a.id,
            risk: a.type === 'RISK_HIGH' || a.type === 'CPU_HIGH' ? 'HIGH' : 'MEDIUM',
            summary: a.message,
            ip: a.server.ip,
            timestamp: a.createdAt
        }));

        return NextResponse.json({
            servers,
            alerts: formattedAlerts
        });
    } catch (error) {
        console.error("Dashboard overview error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
