
"use client";

import dynamic from "next/dynamic";

const Terminal = dynamic(() => import("@/components/Terminal"), {
    ssr: false,
});

export default function TerminalPage() {
    return (
        <div className="p-8 h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Live Terminal</h1>
                <p className="text-zinc-400">Direct access to the agent's shell.</p>
            </div>
            <div className="flex-1 min-h-[500px] border border-zinc-800 rounded-lg overflow-hidden">
                <Terminal />
            </div>
        </div>
    );
}
