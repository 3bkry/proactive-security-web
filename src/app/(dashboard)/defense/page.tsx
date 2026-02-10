
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
    ShieldCheck, ShieldAlert, Search, RefreshCw,
    Unlock, Globe, Server, Clock, AlertCircle
} from 'lucide-react';

export default function Defense() {
    const [bans, setBans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [unbanning, setUnbanning] = useState<string | null>(null);

    const fetchBans = async () => {
        try {
            const res = await axios.get('/api/defense/bans');
            setBans(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUnban = async (banId: string, serverId: string, ip: string) => {
        try {
            setUnbanning(banId);
            await axios.post('/api/defense/bans', { alertId: banId, serverId, ip });
            setBans(bans.filter(b => b.id !== banId));
        } catch (e) {
            console.error(e);
        } finally {
            setUnbanning(null);
        }
    };

    useEffect(() => {
        fetchBans();
        const interval = setInterval(fetchBans, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading && bans.length === 0) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <ShieldCheck className="h-10 w-10 animate-pulse text-blue-500/50" />
            </div>
        );
    }

    return (
        <div className="p-8 h-full flex flex-col space-y-8 overflow-y-auto">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="text-blue-500" size={32} />
                        <h1 className="text-3xl font-bold text-white">Active Defense</h1>
                    </div>
                    <p className="text-zinc-400">Manage global IP bans and satellite firewall rules.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-zinc-950/50 border border-zinc-800 rounded-full px-4 py-2 flex items-center gap-3">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Active Bans</span>
                        <span className="text-white font-mono font-bold">{bans.length}</span>
                    </div>
                    <button
                        onClick={fetchBans}
                        className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all border border-zinc-700"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col min-h-0">
                <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search IP, Reason or Server..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                        Filter By: <span className="text-blue-500 ml-2 cursor-pointer hover:underline">All Nodes</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {bans.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30 grayscale">
                            <Globe size={64} className="text-zinc-600" />
                            <p className="font-medium">No active bans detected across your infrastructure.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-500 tracking-widest bg-zinc-950/20">
                                    <th className="px-6 py-4">Target IP</th>
                                    <th className="px-6 py-4">Source Satellite</th>
                                    <th className="px-6 py-4">Reason / Violation</th>
                                    <th className="px-6 py-4">Banned On</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {bans.map((ban) => (
                                    <tr key={ban.id} className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center text-red-500">
                                                    <Globe size={14} />
                                                </div>
                                                <span className="font-mono text-sm text-white font-medium">{ban.ip}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-zinc-300 flex items-center gap-1.5">
                                                    <Server size={12} className="text-zinc-500" /> {ban.serverName}
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-mono">{ban.hostname}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-zinc-400 text-sm italic">
                                                <ShieldAlert size={14} className="text-amber-500 shrink-0" />
                                                <span className="truncate max-w-[200px]">{ban.reason}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                                <Clock size={12} /> {new Date(ban.bannedAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleUnban(ban.id, ban.serverId, ban.ip)}
                                                disabled={unbanning === ban.id}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                            >
                                                {unbanning === ban.id ? <RefreshCw size={12} className="animate-spin" /> : <Unlock size={12} />}
                                                Revoke Access
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl flex items-start gap-4 shadow-inner">
                <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={24} />
                <div className="space-y-1">
                    <h4 className="text-blue-400 font-bold text-sm">Automated Firewall Governance</h4>
                    <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">
                        Satellite nodes automatically enforce bans via <code className="bg-blue-500/10 px-1 rounded text-white">iptables</code> after 5 consecutive strikes.
                        Revoking access sends an instruction to the remote terminal to purge the exclusion rule.
                    </p>
                </div>
            </div>
        </div>
    );
}
