
"use client";

import { useState } from "react";
import axios from "axios";
import { FileText, ShieldAlert, Search, RefreshCw, Terminal } from "lucide-react";

interface LogManagementProps {
    servers: any[];
    onToggle: () => void;
}

export const LogManagement = ({ servers, onToggle }: LogManagementProps) => {
    const [toggling, setToggling] = useState<string | null>(null);

    const handleToggle = async (serverId: string, path: string, enabled: boolean) => {
        setToggling(`${serverId}-${path}`);
        try {
            await axios.post(`/api/servers/${serverId}/logs/toggle`, { path, enabled });
            onToggle();
        } catch (e) {
            alert("Failed to update log status");
        } finally {
            setToggling(null);
        }
    };

    return (
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="text-indigo-400" /> Log Asset Management
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">Centralized control for monitored log streams.</p>
                </div>
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                    <ShieldAlert size={10} /> Stream Security Active
                </div>
            </div>

            <div className="space-y-4">
                {servers.flatMap(s => (s.watchedFiles || []).map((f: any) => (
                    <div key={`${s.id}-${f.path}`} className="p-4 border border-zinc-800 rounded-xl bg-zinc-950/40 hover:bg-zinc-900/60 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${f.enabled ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                <Search size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white font-mono">{f.path}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">{s.hostname || s.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-right hidden sm:block">
                                <p className="text-[9px] text-zinc-500 uppercase font-bold mb-0.5">Last Check</p>
                                <p className="text-xs text-zinc-300 font-mono">{new Date(f.lastCheck).toLocaleTimeString()}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-[9px] text-zinc-500 uppercase font-bold mb-0.5">Last Update</p>
                                <p className="text-xs text-zinc-300 font-mono">{new Date(f.lastUpdate).toLocaleTimeString()}</p>
                            </div>

                            <button
                                onClick={() => handleToggle(s.id, f.path, !f.enabled)}
                                disabled={toggling === `${s.id}-${f.path}`}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${f.enabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${f.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                {toggling === `${s.id}-${f.path}` && <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center"><RefreshCw size={10} className="animate-spin text-white" /></div>}
                            </button>
                        </div>
                    </div>
                )))}
                {servers.every(s => !(s.watchedFiles && s.watchedFiles.length > 0)) && (
                    <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl">
                        <Search size={32} className="mx-auto text-zinc-700 mb-3" />
                        <p className="text-zinc-500 text-sm italic">No active log watchers detected.</p>
                    </div>
                )}
            </div>

            <div className="mt-8 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Terminal size={14} /> Local Streaming Guide
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                    Real-time log streaming is disabled in the cloud dashboard for security. To stream logs live locally, use:
                    <code className="block mt-2 p-2 bg-zinc-950 rounded text-indigo-300 border border-zinc-800 font-mono">
                        sentinelctl watch [file_path]
                    </code>
                </p>
            </div>
        </div>
    );
};
