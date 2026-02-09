
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await db.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                return user;
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;

                // Fetch fresh user data to get teamId
                const user = await db.user.findUnique({ where: { id: token.sub } });
                if (user) {
                    session.user.teamId = user.teamId;
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        },
        async signIn({ user }) {
            // Auto-create team for new users if not exists
            if (!user.email) return true;

            const dbUser = await db.user.findUnique({ where: { email: user.email } });

            if (dbUser && !dbUser.teamId) {
                // Create a team for this user
                const team = await db.team.create({
                    data: {
                        name: `${user.name || 'User'}'s Team`,
                        apiKey: crypto.randomUUID()
                    }
                });

                await db.user.update({
                    where: { id: dbUser.id },
                    data: { teamId: team.id, role: 'OWNER' }
                });
            }

            return true;
        }
    }
};
