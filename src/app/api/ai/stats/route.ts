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
        const team = await db.team.findUnique({
            where: { id: session.user.teamId }
        });

        if (!team) {
            return new NextResponse("Team not found", { status: 404 });
        }

        // Fetch AI events (alerts with high risk) to show in history
        const history = await db.alert.findMany({
            where: {
                server: { teamId: team.id },
                type: { in: ["AI_RISK_HIGH", "AI_RISK_MEDIUM", "AI_ANALYSIS"] }
            },
            orderBy: { createdAt: "desc" },
            take: 20
        });

        return NextResponse.json({
            totalTokens: team.aiTokenUsage,
            totalCost: (team.aiTokenUsage / 1000) * 0.0005, // Rough estimate for dashboard
            tokenLimit: team.aiTokenLimit,
            provider: team.aiProvider,
            history: history.map((h: any) => ({
                id: h.id,
                timestamp: h.createdAt,
                type: h.type,
                message: h.message,
                serverName: h.server.name,
                details: h.details ? JSON.parse(h.details) : null
            }))
        });

    } catch (error) {
        console.error("AI Stats error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
