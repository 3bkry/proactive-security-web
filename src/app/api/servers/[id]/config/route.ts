
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.teamId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { cpuThreshold, memThreshold, diskThreshold } = body;

        const server = await db.server.findUnique({
            where: { id: params.id }
        });

        if (!server || server.teamId !== session.user.teamId) {
            return new NextResponse("Server not found", { status: 404 });
        }

        await db.server.update({
            where: { id: params.id },
            data: {
                cpuThreshold: cpuThreshold !== undefined ? parseInt(cpuThreshold) : server.cpuThreshold,
                memThreshold: memThreshold !== undefined ? parseInt(memThreshold) : server.memThreshold,
                diskThreshold: diskThreshold !== undefined ? parseInt(diskThreshold) : server.diskThreshold,
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Server config error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
