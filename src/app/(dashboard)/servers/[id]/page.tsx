
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
    Server, Cpu, HardDrive, Clock, CheckCircle, XCircle,
    ShieldAlert, Activity, ArrowLeft, Database, Terminal,
    RefreshCw, AlertTriangle
} from 'lucide-react';
import Link from "next/link";
import { LogManagement } from "@/components/LogManagement";

export default function ServerDetail({ params }: { params: { id: string } }) {
    const [server, setServer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({ cpu: 0, memory: 0, disk: 0, uptime: 0 });

    const fetchData = async () => {
        try {
            const res = await axios.get(`/api/servers/${params.id}`);
            setServer(res.data);

            const raw = res.data.stats ? JSON.parse(res.data.stats) : {};
            setStats({
                cpu: typeof raw.cpu === 'object' ? raw.cpu.load : (raw.cpu || 0),
                memory: typeof raw.memory === 'object' ? raw.memory.usagePercent : (raw.memory || 0),
                disk: typeof raw.disk === 'object' ? raw.disk.usagePercent : (raw.disk || 0),
                uptime: raw.uptime || 0
            });
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
    }, [params.id]);

    if (loading && !server) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <RefreshCw className="h-10 w-10 animate-spin text-indigo-500/50" />
            </div>
        );
    }

    if (!server) {
        return (
            <div className="p-8 text-center">
                <p className="text-zinc-500">Server not found.</p>
                <Link href="/servers" className="text-indigo-400 hover:underline mt-4 inline-block">Back to Servers</Link>
            </div>
        );
    }

    return (
        <div className="p-8 h-full flex flex-col space-y-8 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <Link href="/servers" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">{server.name}</h1>
                            {server.status === 'ONLINE' ?
                                <span className="flex items-center text-green-400 text-[10px] font-bold px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20 uppercase tracking-widest"><CheckCircle size={10} className="mr-1" /> Online</span> :
                                <span className="flex items-center text-red-400 text-[10px] font-bold px-2 py-0.5 bg-red-500/10 rounded-full border border-red-500/20 uppercase tracking-widest"><XCircle size={10} className="mr-1" /> Offline</span>
                            }
                        </div>
                        <p className="text-zinc-400 font-mono text-sm mt-1">{server.hostname} • {server.ip} • {server.platform}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors border border-zinc-700">Configure</button>
                    <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors border border-red-500/20 text-red-400">Hard Restart</button>
                </div>
            </div>

            {/* Tactical Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Resource Gauges */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Activity size={14} /> Vital Signs
                        </h3>
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs text-zinc-400 font-medium">CPU Utilization</span>
                                    <span className="text-lg font-bold text-white font-mono">{Math.round(stats.cpu)}%</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${stats.cpu > 80 ? 'bg-red-500' : stats.cpu > 50 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${stats.cpu}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs text-zinc-400 font-medium">Memory Usage</span>
                                    <span className="text-lg font-bold text-white font-mono">{Math.round(stats.memory)}%</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${stats.memory > 90 ? 'bg-red-500' : stats.memory > 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                                        style={{ width: `${stats.memory}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs text-zinc-400 font-medium">Storage Capacity</span>
                                    <span className="text-lg font-bold text-white font-mono">{Math.round(stats.disk)}%</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${stats.disk > 90 ? 'bg-red-500' : stats.disk > 75 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                        style={{ width: `${stats.disk}%` }}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-zinc-800 flex justify-between items-center text-zinc-500">
                                <span className="text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1">
                                    <Clock size={12} /> System Uptime
                                </span>
                                <span className="text-xs font-mono">{Math.floor(stats.uptime / 3600)}h {Math.floor((stats.uptime % 3600) / 60)}m</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ShieldAlert size={14} /> Security Profile
                        </h3>
                        <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">Risk Threshold</span>
                                <span className="text-white font-bold">Standard</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">Active Bans</span>
                                <span className="text-amber-500 font-bold">0 Active</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">Last Scan</span>
                                <span className="text-zinc-400 font-mono">Just now</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Log Management for this specific server */}
                    <LogManagement
                        servers={[server]}
                        onToggle={fetchData}
                    />

                    {/* Security Events / Alerts */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-zinc-800 bg-zinc-950/30 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest">
                                <ShieldAlert size={18} className="text-red-500" /> Recent Security Events
                            </h3>
                            <Link href="/incidents" className="text-xs text-indigo-400 hover:underline">View All Archival</Link>
                        </div>
                        <div className="divide-y divide-zinc-800">
                            {server.alerts && server.alerts.length > 0 ? (
                                server.alerts.map((alert: any) => (
                                    <div key={alert.id} className="p-4 hover:bg-zinc-800/30 transition-colors flex items-start gap-4">
                                        <div className={`mt-1 p-1.5 rounded-lg ${alert.type.includes('HIGH') ? 'bg-red-500/10 text-red-500' :
                                                alert.type.includes('MEDIUM') ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'
                                            }`}>
                                            <AlertTriangle size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between font-mono text-[10px] text-zinc-500 mb-1 leading-none uppercase tracking-tighter">
                                                <span>{alert.type}</span>
                                                <span>{new Date(alert.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-zinc-200">{alert.message}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-zinc-600 italic">
                                    No immediate security incidents detected for this node.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
