
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@sentinel.ai';
    const password = await bcrypt.hash('password123', 12);
    const name = 'Admin User';

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        console.log(`User ${email} already exists.`);
        return;
    }

    const team = await prisma.team.create({
        data: {
            name: "Sentinel Admins",
            apiKey: crypto.randomUUID(),
        },
    });

    const user = await prisma.user.create({
        data: {
            email,
            name,
            password,
            role: 'OWNER',
            teamId: team.id,
        },
    });

    console.log(`Created user: ${user.email} (password: password123)`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
