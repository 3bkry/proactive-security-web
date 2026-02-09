
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password || !name) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return new NextResponse("User already exists", { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Create Team
        const team = await db.team.create({
            data: {
                name: `${name}'s Team`,
                apiKey: crypto.randomUUID()
            }
        });

        // Create User
        const user = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                teamId: team.id,
                role: 'OWNER'
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Registration error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
