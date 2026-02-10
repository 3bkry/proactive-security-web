import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

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

        return NextResponse.json({
            aiProvider: team.aiProvider,
            apiKey: team.apiKey,
            aiModel: team.aiModel,
            geminiApiKey: team.geminiApiKey ? "****" + team.geminiApiKey.slice(-4) : null,
            openaiApiKey: team.openaiApiKey ? "****" + team.openaiApiKey.slice(-4) : null,
            zhipuApiKey: team.zhipuApiKey ? "****" + team.zhipuApiKey.slice(-4) : null,
            telegramToken: team.telegramToken ? "****" + team.telegramToken.slice(-4) : null,
            telegramChatId: team.telegramChatId ? "****" + team.telegramChatId.slice(-4) : null,
        });
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.teamId) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();
        const { aiProvider, aiModel, geminiApiKey, openaiApiKey, zhipuApiKey, telegramToken, telegramChatId } = body;

        const team = await db.team.findUnique({
            where: { id: session.user.teamId }
        });

        if (!team) return new NextResponse("Team not found", { status: 404 });

        await db.team.update({
            where: { id: team.id },
            data: {
                aiProvider: aiProvider || team.aiProvider,
                aiModel: aiModel || team.aiModel,
                geminiApiKey: geminiApiKey || team.geminiApiKey,
                openaiApiKey: openaiApiKey || team.openaiApiKey,
                zhipuApiKey: zhipuApiKey || team.zhipuApiKey,
                telegramToken: telegramToken || team.telegramToken,
                telegramChatId: telegramChatId || team.telegramChatId,
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
