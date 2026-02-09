
import { db } from "@/lib/db";
import { validateAgentKey, unauthorized } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const team = await validateAgentKey(req);
    if (!team) return unauthorized();

    try {
        const body = await req.json();
        const { hostname, platform, version, ip } = body;

        // Validate required fields
        if (!hostname) {
            return new NextResponse("Missing hostname", { status: 400 });
        }

        // Register or update server
        const server = await db.server.upsert({
            where: {
                teamId_hostname: {
                    teamId: team.id,
                    hostname: hostname,
                },
            },
            update: {
                ip: ip || null,
                platform: platform || null,
                version: version || null,
                lastSeen: new Date(),
                status: "ONLINE"
            },
            create: {
                teamId: team.id,
                name: hostname, // Default name to hostname
                hostname: hostname,
                ip: ip || null,
                platform: platform || null,
                version: version || null,
                status: "ONLINE"
            },
        });

        return NextResponse.json({ success: true, serverId: server.id });
    } catch (error) {
        console.error("Agent connect error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
