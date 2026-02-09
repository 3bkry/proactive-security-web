
import { db } from "@/lib/db";
import { validateAgentKey, unauthorized } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const team = await validateAgentKey(req);
    if (!team) return unauthorized();

    try {
        const body = await req.json();
        const { status, result } = body;
        const commandId = params.id;

        if (!status) {
            return new NextResponse("Missing status", { status: 400 });
        }

        // Verify command ownership via server -> team
        const command = await db.command.findUnique({
            where: { id: commandId },
            include: { server: true }
        });

        if (!command || command.server.teamId !== team.id) {
            return new NextResponse("Command not found or unauthorized", { status: 404 });
        }

        // Update command
        await db.command.update({
            where: { id: commandId },
            data: {
                status: status, // COMPLETED, FAILED
                result: result ? JSON.stringify(result) : null,
                completedAt: new Date()
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Agent command result error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
