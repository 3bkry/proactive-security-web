
import { db } from "@/lib/db";
import { validateAgentKey, unauthorized } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const team = await validateAgentKey(req);
    if (!team) return unauthorized();

    try {
        const body = await req.json();
        const { serverId, type, message, details, isResolved } = body;

        if (!serverId || !type || !message) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Verify server belongs to team
        const server = await db.server.findUnique({
            where: { id: serverId },
        });

        if (!server || server.teamId !== team.id) {
            return new NextResponse("Server not found or unauthorized", { status: 404 });
        }

        // Create alert
        const alert = await db.alert.create({
            data: {
                serverId,
                type,
                message,
                details: details ? JSON.stringify(details) : null,
                isResolved: isResolved || false
            }
        });

        return NextResponse.json({ success: true, alertId: alert.id });

    } catch (error) {
        console.error("Agent alert error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
