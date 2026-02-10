
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Server, Cpu, HardDrive, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function Servers() {
    const [servers, setServers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/dashboard/overview');
            setServers(res.data.servers);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (dateString: string) => {
        // Simple uptime calculation based on lastSeen for now, ideally server sends its uptime
        return "Active";
    };

    if (loading && servers.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-zinc-500">Loading servers...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Servers</h1>
            <p className="text-zinc-400 mb-8">Manage your monitored infrastructure.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servers.map((server) => {
                    const getStats = () => {
                        try {
                            const raw = server.stats ? JSON.parse(server.stats) : {};
                            return {
                                cpu: typeof raw.cpu === 'object' ? raw.cpu.load : (raw.cpu || 0),
                                memory: typeof raw.memory === 'object' ? raw.memory.usagePercent : (raw.memory || 0),
                                disk: typeof raw.disk === 'object' ? raw.disk.usagePercent : (raw.disk || 0),
                                uptime: raw.uptime || 0
                            };
                        } catch (e) {
                            return { cpu: 0, memory: 0, disk: 0, uptime: 0 };
                        }
                    };
                    const stats = getStats();

                    return (
                        <div key={server.id} className={`p-6 bg-zinc-900 border ${server.status === 'ONLINE' ? 'border-green-500/20' : 'border-red-500/20'} rounded-lg`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded bg-zinc-800 ${server.status === 'ONLINE' ? 'text-green-400' : 'text-red-400'}`}>
                                        <Server size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{server.name}</h3>
                                        <p className="text-xs text-zinc-500">{server.platform || 'Linux'} ({server.ip})</p>
                                    </div>
                                </div>
                                {server.status === 'ONLINE' ?
                                    <span className="flex items-center text-green-400 text-xs px-2 py-1 bg-green-500/10 rounded border border-green-500/20"><CheckCircle size={12} className="mr-1" /> Online</span> :
                                    <span className="flex items-center text-red-400 text-xs px-2 py-1 bg-red-500/10 rounded border border-red-500/20"><XCircle size={12} className="mr-1" /> Offline</span>
                                }
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                                    <div className="flex items-center text-zinc-400 text-sm"><Cpu size={16} className="mr-2" /> CPU Load</div>
                                    <span className="text-white font-mono">{Math.round(stats.cpu)}%</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                                    <div className="flex items-center text-zinc-400 text-sm"><HardDrive size={16} className="mr-2" /> Memory</div>
                                    <span className="text-white font-mono">{Math.round(stats.memory)}%</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                                    <div className="flex items-center text-zinc-400 text-sm"><Clock size={16} className="mr-2" /> Uptime</div>
                                    <span className="text-white font-mono text-xs">{`${Math.floor(stats.uptime / 3600)}h ${Math.floor((stats.uptime % 3600) / 60)}m`}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex space-x-2">
                                <button className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-medium transition-colors">Details</button>
                                <button className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-medium transition-colors text-red-400 hover:text-red-300">Reboot</button>
                            </div>
                        </div>
                    );
                })}
                {servers.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-zinc-500">
                        No servers found. Use the connect command on your dashboard to add one.
                    </div>
                )}
            </div>
        </div>
    );
}
