
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.teamId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const server = await db.server.findUnique({
            where: { id: params.id },
            include: {
                watchedFiles: true,
                alerts: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 20
                }
            }
        });

        if (!server || server.teamId !== session.user.teamId) {
            return new NextResponse("Server not found", { status: 404 });
        }

        return NextResponse.json(server);

    } catch (error) {
        console.error("Server detail error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
