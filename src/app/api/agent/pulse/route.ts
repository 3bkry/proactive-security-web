
import { db } from "@/lib/db";
import { validateAgentKey, unauthorized } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const team = await validateAgentKey(req);
    if (!team) return unauthorized();

    try {
        const body = await req.json();
        const { serverId, stats } = body;

        if (!serverId) {
            return new NextResponse("Missing serverId", { status: 400 });
        }

        // Verify server belongs to team
        const server = await db.server.findUnique({
            where: { id: serverId },
        });

        if (!server || server.teamId !== team.id) {
            return new NextResponse("Server not found or unauthorized", { status: 404 });
        }

        // Update server stats
        await db.server.update({
            where: { id: serverId },
            data: {
                status: "ONLINE",
                lastSeen: new Date(),
                stats: JSON.stringify(stats),
            }
        });

        // Check for pending commands
        const pendingCommands = await db.command.findMany({
            where: {
                serverId: serverId,
                status: "PENDING"
            },
            orderBy: { createdAt: 'asc' }
        });

        // Mark commands as SENT
        if (pendingCommands.length > 0) {
            await db.command.updateMany({
                where: {
                    id: { in: pendingCommands.map(c => c.id) }
                },
                data: { status: "SENT" }
            });
        }

        return NextResponse.json({ success: true, commands: pendingCommands });

    } catch (error) {
        console.error("Agent pulse error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
