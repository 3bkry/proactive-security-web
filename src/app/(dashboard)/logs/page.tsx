
"use client";

import { useWebSocket } from "@/context/WebSocketContext";
import { useState, useEffect, useMemo } from "react";
import {
    FileText, RefreshCw, Eye, Clock, ListFilter,
    ShieldCheck, AlertTriangle, Search, Settings2,
    ToggleLeft, ToggleRight, Info, Zap
} from 'lucide-react';

interface WatchedFile {
    path: string;
    stats: { size: number; mtime: string } | null;
    settings?: {
        enabled: boolean;
        sampleRate: number;
        filterHttp: boolean;
    };
    watched?: boolean;
}

export default function LogsPage() {
    const { socket, sendMessage } = useWebSocket();
    const [files, setFiles] = useState<WatchedFile[]>([]);
    const [discovered, setDiscovered] = useState<WatchedFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [logContent, setLogContent] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'active' | 'discovery'>('active');
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (socket) {
            sendMessage({ type: "get_watched_files" });
            sendMessage({ type: "discover_logs" });

            const handleMessage = (event: MessageEvent) => {
                const msg = JSON.parse(event.data);
                if (msg.type === "watched_files") {
                    setFiles(msg.data);
                } else if (msg.type === "discovered_files") {
                    setDiscovered(msg.data);
                } else if (msg.type === "log_content") {
                    setLogContent(msg.data.content);
                    setLoading(false);
                } else if (msg.type === "options_updated") {
                    sendMessage({ type: "get_watched_files" });
                    sendMessage({ type: "discover_logs" });
                }
            };

            socket.addEventListener("message", handleMessage);
            return () => socket.removeEventListener("message", handleMessage);
        }
    }, [socket]);

    const handleViewLog = (path: string) => {
        if (selectedFile === path && logContent && !loading) return;
        setSelectedFile(path);
        setLoading(true);
        sendMessage({ type: "read_log_file", data: { path, lines: 100 } });
    };

    const updateOptions = (path: string, options: Partial<WatchedFile['settings']>) => {
        sendMessage({
            type: "update_log_options",
            data: { path, ...options }
        });
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredFiles = useMemo(() => {
        const list = viewMode === 'active' ? files : discovered;
        return list
            .filter(f => f.path.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => {
                const mtimeA = a.stats?.mtime ? new Date(a.stats.mtime).getTime() : 0;
                const mtimeB = b.stats?.mtime ? new Date(b.stats.mtime).getTime() : 0;
                return mtimeB - mtimeA;
            });
    }, [files, discovered, viewMode, search]);

    return (
        <div className="p-8 h-full flex flex-col space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Log Sentinel</h1>
                    <p className="text-zinc-400">Advanced Log Monitoring & AI Defense</p>
                </div>
                <div className="flex items-center space-x-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    <button
                        onClick={() => setViewMode('active')}
                        className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${viewMode === 'active' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setViewMode('discovery')}
                        className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${viewMode === 'discovery' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Discover
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                {/* File Management */}
                <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-2xl">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 space-y-4">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-2.5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Filter logs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {filteredFiles.length === 0 ? (
                            <div className="text-center p-8 text-zinc-500 italic text-sm">No files found.</div>
                        ) : (
                            filteredFiles.map((file) => (
                                <div key={file.path} className="group relative">
                                    <button
                                        onClick={() => handleViewLog(file.path)}
                                        className={`w-full text-left p-3 rounded-lg flex flex-col transition-all border ${selectedFile === file.path ? 'bg-indigo-600/10 border-indigo-500/50' : 'hover:bg-zinc-800 border-transparent'}`}
                                    >
                                        <div className="flex justify-between items-center w-full mb-1">
                                            <span className={`font-mono text-sm truncate pr-2 ${selectedFile === file.path ? 'text-indigo-300 font-bold' : 'text-zinc-300'}`}>
                                                {file.path.split('/').pop()}
                                            </span>
                                            {file.settings?.enabled && <ShieldCheck size={14} className="text-teal-400 shrink-0" />}
                                            {!file.settings?.enabled && viewMode === 'active' && <AlertTriangle size={14} className="text-amber-500 shrink-0" />}
                                        </div>
                                        <div className="text-[10px] text-zinc-500 truncate font-mono">
                                            {file.path}
                                        </div>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Log & Options Viewer */}
                <div className="lg:col-span-3 h-full flex flex-col space-y-6 min-h-0">
                    {/* Active File Options */}
                    {selectedFile && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center gap-6 shadow-xl border-l-4 border-l-indigo-500">
                            <div className="flex items-center space-x-3">
                                {viewMode === 'active' ? (
                                    <button
                                        onClick={() => updateOptions(selectedFile, { enabled: !files.find(f => f.path === selectedFile)?.settings?.enabled })}
                                        className="transition-transform active:scale-95"
                                    >
                                        {files.find(f => f.path === selectedFile)?.settings?.enabled ? (
                                            <ToggleRight className="text-indigo-400" size={32} />
                                        ) : (
                                            <ToggleLeft className="text-zinc-600" size={32} />
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => updateOptions(selectedFile, { enabled: true })}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                                    >
                                        Enable Sentinel
                                    </button>
                                )}
                                <div className="text-sm">
                                    <div className="font-bold text-white">Monitoring</div>
                                    <div className="text-zinc-500 text-xs">AI Security Active</div>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-zinc-800 hidden sm:block"></div>

                            <div className="flex items-center space-x-4">
                                <div className="text-sm font-medium text-zinc-400 flex items-center">
                                    <Zap size={14} className="mr-2 text-amber-400" /> Scan Rate
                                </div>
                                <select
                                    className="bg-zinc-950 text-white text-xs border border-zinc-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                                    value={files.find(f => f.path === selectedFile)?.settings?.sampleRate || 1}
                                    onChange={(e) => updateOptions(selectedFile, { sampleRate: parseInt(e.target.value) })}
                                >
                                    <option value="1">Every line (1:1)</option>
                                    <option value="5">Every 5 lines</option>
                                    <option value="10">Every 10 lines</option>
                                    <option value="50">Every 50 lines</option>
                                </select>
                            </div>

                            <div className="h-10 w-px bg-zinc-800 hidden sm:block"></div>

                            <div className="flex items-center space-x-4">
                                <div className="text-sm font-medium text-zinc-400 flex items-center">
                                    <ListFilter size={14} className="mr-2 text-indigo-400" /> Smart Filter
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="filterHttp"
                                        checked={files.find(f => f.path === selectedFile)?.settings?.filterHttp || false}
                                        onChange={(e) => updateOptions(selectedFile, { filterHttp: e.target.checked })}
                                        className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-900"
                                    />
                                    <label htmlFor="filterHttp" className="text-xs text-zinc-300 cursor-pointer">
                                        POST/GET Params Only
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Terminal Viewer */}
                    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-2xl">
                        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                            <div className="flex items-center space-x-3 text-sm">
                                <FileText size={16} className="text-zinc-400" />
                                <span className="font-mono text-zinc-200 truncate max-w-md">
                                    {selectedFile || "Live Stream View"}
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                    {loading ? "Syncing..." : "Real-time Ready"}
                                </span>
                                {selectedFile && (
                                    <button onClick={() => handleViewLog(selectedFile)} className="p-1 hover:text-white text-zinc-500 transition-colors">
                                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 bg-[#0a0a0b] overflow-auto p-6 font-mono text-[11px] leading-relaxed text-zinc-300">
                            {selectedFile ? (
                                loading ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                        <div className="text-zinc-500 animate-pulse">Reading log segment...</div>
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-wrap">
                                        {logContent || <span className="text-zinc-700 italic">No entries in the current window. Monitoring for new events...</span>}
                                    </div>
                                )
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 grayscale opacity-40">
                                    <FileText size={64} className="text-indigo-500 mb-2" />
                                    <div className="space-y-1">
                                        <p className="text-white text-lg font-bold">No Log Selected</p>
                                        <p className="text-zinc-500 max-w-xs text-xs">Select an active log or discover new ones to begin AI monitoring.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950/20 text-[10px] text-zinc-600 flex justify-between">
                            <div>Tail Buffer: 100 lines</div>
                            <div>UTF-8 Encoding</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
