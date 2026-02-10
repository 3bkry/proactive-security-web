
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
        const { path, enabled } = body;

        if (!path) {
            return new NextResponse("Path is required", { status: 400 });
        }

        const server = await db.server.findUnique({
            where: { id: params.id }
        });

        if (!server || server.teamId !== session.user.teamId) {
            return new NextResponse("Server not found", { status: 404 });
        }

        await db.watchedFile.update({
            where: {
                serverId_path: {
                    serverId: params.id,
                    path: path
                }
            },
            data: { enabled: !!enabled }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Log toggle error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
