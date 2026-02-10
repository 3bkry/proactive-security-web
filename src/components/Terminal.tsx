"use client";



export default function Terminal() {
    return (
        <div className="w-full h-full min-h-[500px] border border-gray-800 rounded-lg overflow-hidden bg-[#0f0f0f] p-4 font-mono text-zinc-400 text-sm">
            <div>$ sentinelctl status</div>
            <div className="text-green-400">Online</div>
            <br />
            <div>$ # Cloud Terminal is currently in read-only mode for security.</div>
            <div>$ # Please use the local 'sentinelctl' CLI for interactive commands.</div>
            <div className="mt-2 animate-pulse">_</div>
        </div>
    );
}
