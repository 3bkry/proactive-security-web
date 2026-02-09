
import { db } from "./db";
import { NextRequest, NextResponse } from "next/server";

export async function validateAgentKey(req: NextRequest) {
    const apiKey = req.headers.get("x-agent-key");

    if (!apiKey) {
        return null;
    }

    const team = await db.team.findUnique({
        where: { apiKey },
    });

    return team;
}

export function unauthorized() {
    return new NextResponse("Unauthorized: Invalid API Key", { status: 401 });
}
