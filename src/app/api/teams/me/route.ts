
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

        return NextResponse.json(team);
    } catch (error) {
        console.error("Team fetch error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
