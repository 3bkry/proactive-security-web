
"use client";

import { useWebSocket } from "@/context/WebSocketContext";
import { Server, Cpu, HardDrive, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function Servers() {
    const { serverStats } = useWebSocket();

    if (!serverStats) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-zinc-500">Connecting to Sentinel Agent...</p>
            </div>
        );
    }

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Servers</h1>
            <p className="text-zinc-400 mb-8">Manage your monitored infrastructure.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className={`p-6 bg-zinc-900 border ${serverStats.status === 'online' ? 'border-green-500/20' : 'border-red-500/20'} rounded-lg`}>
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded bg-zinc-800 ${serverStats.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                                <Server size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{serverStats.hostname}</h3>
                                <p className="text-xs text-zinc-500">{serverStats.platform} ({serverStats.arch})</p>
                            </div>
                        </div>
                        {serverStats.status === 'online' ?
                            <span className="flex items-center text-green-400 text-xs px-2 py-1 bg-green-500/10 rounded border border-green-500/20"><CheckCircle size={12} className="mr-1" /> Online</span> :
                            <span className="flex items-center text-red-400 text-xs px-2 py-1 bg-red-500/10 rounded border border-red-500/20"><XCircle size={12} className="mr-1" /> Offline</span>
                        }
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                            <div className="flex items-center text-zinc-400 text-sm"><Cpu size={16} className="mr-2" /> CPU Cores</div>
                            <span className="text-white font-mono">{serverStats.cpus}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                            <div className="flex items-center text-zinc-400 text-sm"><HardDrive size={16} className="mr-2" /> Memory</div>
                            <span className="text-white font-mono">{Math.round(parseInt(serverStats.memory || "0") / (1024 * 1024))} MB Used</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                            <div className="flex items-center text-zinc-400 text-sm"><Clock size={16} className="mr-2" /> Uptime</div>
                            <span className="text-white font-mono">{formatUptime(serverStats.uptime)}</span>
                        </div>
                    </div>

                    <div className="mt-6 flex space-x-2">
                        <button className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-medium transition-colors">Details</button>
                        <button className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-medium transition-colors text-red-400 hover:text-red-300">Reboot</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
