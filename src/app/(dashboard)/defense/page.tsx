
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
    ShieldCheck, ShieldAlert, Search, RefreshCw,
    Unlock, Globe, Server, Clock, AlertCircle, CheckSquare, Square, Loader2
} from 'lucide-react';

export default function Defense() {
    const [bans, setBans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [unbanning, setUnbanning] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [bulkUnbanning, setBulkUnbanning] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
    const [searchQuery, setSearchQuery] = useState("");

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
            setBans(prev => prev.filter(b => b.id !== banId));
            setSelected(prev => { const n = new Set(prev); n.delete(banId); return n; });
        } catch (e) {
            console.error(e);
        } finally {
            setUnbanning(null);
        }
    };

    const handleBulkUnban = async () => {
        if (selected.size === 0) return;
        setBulkUnbanning(true);
        setBulkProgress({ done: 0, total: selected.size });

        const selectedBans = bans.filter(b => selected.has(b.id));
        // Group by server for efficient processing
        const byServer = new Map<string, Array<{ alertId: string; serverId: string; ip: string }>>();
        for (const ban of selectedBans) {
            const group = byServer.get(ban.serverId) || [];
            group.push({ alertId: ban.id, serverId: ban.serverId, ip: ban.ip });
            byServer.set(ban.serverId, group);
        }

        let totalDone = 0;
        const unbannedIds = new Set<string>();

        // Process each server group with bulk API
        for (const [, items] of byServer) {
            try {
                const res = await axios.post('/api/defense/bans', { items });
                if (res.data.success) {
                    for (const item of items) {
                        unbannedIds.add(item.alertId);
                    }
                }
                totalDone += items.length;
                setBulkProgress({ done: totalDone, total: selected.size });

                // Small delay between server groups to avoid agent overload
                if (byServer.size > 1) {
                    await new Promise(r => setTimeout(r, 500));
                }
            } catch (e) {
                console.error('Bulk unban error:', e);
                totalDone += items.length;
                setBulkProgress({ done: totalDone, total: selected.size });
            }
        }

        setBans(prev => prev.filter(b => !unbannedIds.has(b.id)));
        setSelected(new Set());
        setBulkUnbanning(false);
    };

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === filteredBans.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filteredBans.map(b => b.id)));
        }
    };

    useEffect(() => {
        fetchBans();
        const interval = setInterval(fetchBans, 10000);
        return () => clearInterval(interval);
    }, []);

    const filteredBans = bans.filter(b =>
        !searchQuery ||
        b.ip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.serverName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <div className="flex gap-4 items-center">
                    {selected.size > 0 && (
                        <button
                            onClick={handleBulkUnban}
                            disabled={bulkUnbanning}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                        >
                            {bulkUnbanning ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Unbanning {bulkProgress.done}/{bulkProgress.total}...
                                </>
                            ) : (
                                <>
                                    <Unlock size={14} />
                                    Unban Selected ({selected.size})
                                </>
                            )}
                        </button>
                    )}
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                        {selected.size > 0 && <span className="text-blue-400 mr-4">{selected.size} selected</span>}
                        Filter By: <span className="text-blue-500 ml-2 cursor-pointer hover:underline">All Nodes</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredBans.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30 grayscale">
                            <Globe size={64} className="text-zinc-600" />
                            <p className="font-medium">{bans.length === 0 ? 'No active bans detected across your infrastructure.' : 'No bans match your search.'}</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-500 tracking-widest bg-zinc-950/20">
                                    <th className="px-4 py-4 w-10">
                                        <button onClick={toggleSelectAll} className="text-zinc-500 hover:text-white transition-colors">
                                            {selected.size === filteredBans.length && filteredBans.length > 0
                                                ? <CheckSquare size={16} className="text-blue-500" />
                                                : <Square size={16} />
                                            }
                                        </button>
                                    </th>
                                    <th className="px-4 py-4">Target IP</th>
                                    <th className="px-4 py-4">Source Satellite</th>
                                    <th className="px-4 py-4">Reason / Violation</th>
                                    <th className="px-4 py-4">Banned On</th>
                                    <th className="px-4 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {filteredBans.map((ban) => (
                                    <tr
                                        key={ban.id}
                                        className={`hover:bg-zinc-800/30 transition-colors group ${selected.has(ban.id) ? 'bg-blue-500/5' : ''}`}
                                    >
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => toggleSelect(ban.id)}
                                                className="text-zinc-500 hover:text-white transition-colors"
                                            >
                                                {selected.has(ban.id)
                                                    ? <CheckSquare size={16} className="text-blue-500" />
                                                    : <Square size={16} />
                                                }
                                            </button>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center text-red-500">
                                                    <Globe size={14} />
                                                </div>
                                                <span className="font-mono text-sm text-white font-medium">{ban.ip}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-zinc-300 flex items-center gap-1.5">
                                                    <Server size={12} className="text-zinc-500" /> {ban.serverName}
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-mono">{ban.hostname}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-zinc-400 text-sm italic">
                                                <ShieldAlert size={14} className="text-amber-500 shrink-0" />
                                                <span className="truncate max-w-[200px]">{ban.reason}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                                <Clock size={12} /> {new Date(ban.bannedAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                onClick={() => handleUnban(ban.id, ban.serverId, ban.ip)}
                                                disabled={unbanning === ban.id || bulkUnbanning}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                            >
                                                {unbanning === ban.id ? <RefreshCw size={12} className="animate-spin" /> : <Unlock size={12} />}
                                                Revoke
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
                        Unbanning removes the IP from <code className="bg-blue-500/10 px-1 rounded text-white">Cloudflare</code>, <code className="bg-blue-500/10 px-1 rounded text-white">iptables</code>, and any web server deny rules simultaneously.
                        Use the checkboxes to select multiple bans and unban them in bulk.
                    </p>
                </div>
            </div>
        </div>
    );
}
