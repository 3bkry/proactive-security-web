
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

        // Increment team AI token usage if provided
        if (body.tokensUsed && body.tokensUsed > 0) {
            await db.team.update({
                where: { id: team.id },
                data: {
                    aiTokenUsage: {
                        increment: body.tokensUsed
                    }
                }
            });
        }

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
                    id: { in: pendingCommands.map((c: any) => c.id) }
                },
                data: { status: "SENT" }
            });
        }

        // Sync watched files if provided
        if (body.files && Array.isArray(body.files)) {
            for (const file of body.files) {
                await db.watchedFile.upsert({
                    where: {
                        serverId_path: {
                            serverId: serverId,
                            path: file.path
                        }
                    },
                    update: {
                        lastCheck: new Date(),
                        lastUpdate: file.lastUpdate ? new Date(file.lastUpdate) : undefined,
                    },
                    create: {
                        serverId: serverId,
                        path: file.path,
                        enabled: true,
                        lastCheck: new Date(),
                        lastUpdate: file.lastUpdate ? new Date(file.lastUpdate) : new Date(),
                    }
                });
            }
        }

        const dbFiles = await db.watchedFile.findMany({
            where: { serverId: serverId }
        });

        return NextResponse.json({
            success: true,
            commands: pendingCommands,
            thresholds: {
                cpu: server.cpuThreshold,
                mem: server.memThreshold,
                disk: server.diskThreshold
            },
            aiConfig: {
                provider: team.aiProvider,
                geminiKey: team.geminiApiKey,
                openaiKey: team.openaiApiKey
            },
            files: dbFiles.map((f: any) => ({
                path: f.path,
                enabled: f.enabled
            }))
        });

    } catch (error) {
        console.error("Agent pulse error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
