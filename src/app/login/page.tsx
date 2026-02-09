
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Github, Mail } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await signIn("credentials", {
            email,
            password,
            callbackUrl: "/dashboard"
        });
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 mb-4">
                        <Lock className="h-6 w-6 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
                    <p className="mt-2 text-zinc-400">Sign in to your ActiveSentinel account</p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                            className="flex items-center justify-center px-4 py-2 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
                        >
                            <Github className="h-4 w-4 mr-2" />
                            GitHub
                        </button>
                        <button
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                            className="flex items-center justify-center px-4 py-2 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Google
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
                        </div>
                    </div>

                    <form onSubmit={handleCredentialsLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">Email address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                                placeholder="name@company.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-zinc-500">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
