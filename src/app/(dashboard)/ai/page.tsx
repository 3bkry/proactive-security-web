
"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
    BrainCircuit, Coins, BarChart3, Zap,
    Terminal as TerminalIcon, Code, History,
    Save, Edit3, ChevronDown, ChevronUp, AlertCircle, Info
} from 'lucide-react';

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-zinc-700 transition-colors group">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-zinc-400 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-indigo-400 transition-colors">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg bg-zinc-800 text-${color}-400`}>
                <Icon size={20} />
            </div>
        </div>
        <p className="text-xs text-zinc-500">{sub}</p>
    </div>
);

export default function AI() {
    const [stats, setStats] = useState({
        totalTokens: 0,
        totalCost: 0,
        requestCount: 0,
        model: "SATELLITE",
        provider: "gemini"
    });
    const [history, setHistory] = useState<any[]>([]);
    const [activeAssets, setActiveAssets] = useState<any[]>([]);
    const [prompt, setPrompt] = useState("");
    const [isEditingPrompt, setIsEditingPrompt] = useState(false);
    const [expandedHistory, setExpandedHistory] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/ai/stats');
                setStats({
                    totalTokens: response.data.totalTokens,
                    totalCost: response.data.totalCost,
                    requestCount: response.data.history.length,
                    model: response.data.provider === 'openai' ? 'GPT-4o' : 'Gemini 3 Flash',
                    provider: response.data.provider
                });
                setHistory(response.data.history);
            } catch (error) {
                console.error("Failed to fetch AI stats", error);
            }
        };
        const fetchAssets = async () => {
            try {
                const response = await axios.get('/api/dashboard/overview');
                const assets = response.data.servers.flatMap((s: any) =>
                    (s.watchedFiles || []).map((f: any) => ({
                        ...f,
                        serverName: s.name,
                        hostname: s.hostname
                    }))
                ).filter((a: any) => a.enabled).sort((a: any, b: any) =>
                    new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
                );
                setActiveAssets(assets.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch assets", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        fetchAssets();
        const interval = setInterval(() => {
            fetchStats();
            fetchAssets();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleSavePrompt = async () => {
        setIsEditingPrompt(false);
    };

    if (loading && history.length === 0) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <BrainCircuit className="h-12 w-12 animate-pulse text-indigo-500/30" />
            </div>
        );
    }

    return (
        <div className="p-8 h-full flex flex-col space-y-8 overflow-y-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">AI Neural Center</h1>
                    <p className="text-zinc-400">Security logic, token economy, and audit logs.</p>
                </div>
                <div className="text-xs font-mono text-zinc-600 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                    STATUS: <span className="text-teal-500">OPTIMIZED</span>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Tokens"
                    value={stats.totalTokens.toLocaleString()}
                    sub="Current Session"
                    icon={BrainCircuit}
                    color="purple"
                />
                <StatCard
                    title="Estimated Cost"
                    value={`$${stats.totalCost.toFixed(5)}`}
                    sub="Based on $0.35/1M"
                    icon={Coins}
                    color="yellow"
                />
                <StatCard
                    title="Requests"
                    value={stats.requestCount}
                    sub="AI Invocations"
                    icon={Zap}
                    color="blue"
                />
                <StatCard
                    title="Neural Model"
                    value={stats.model.split(" ")[0]}
                    sub={stats.model.split(" ").slice(1).join(" ")}
                    icon={BarChart3}
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1 min-h-0">
                {/* Prompt Editor */}
                <div className="xl:col-span-1 flex flex-col h-full">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center text-sm">
                                <Code size={18} className="mr-2 text-indigo-400" /> AI Instruction Set
                            </h3>
                            <button
                                onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                                className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                            >
                                <Edit3 size={16} />
                            </button>
                        </div>
                        <div className="flex-1 p-4 flex flex-col space-y-4">
                            <div className="relative flex-1">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    readOnly={!isEditingPrompt}
                                    className={`w-full h-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs leading-relaxed text-zinc-300 focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-inner ${!isEditingPrompt ? 'opacity-70' : 'opacity-100'}`}
                                    placeholder="Enter AI system prompt..."
                                />
                                {isEditingPrompt && (
                                    <button
                                        onClick={handleSavePrompt}
                                        className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg flex items-center shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                                    >
                                        <Save size={16} className="mr-2" /> Save Prompt
                                    </button>
                                )}
                            </div>

                            {/* Live Asset Activity */}
                            <div className="bg-zinc-950/30 border border-zinc-800/50 rounded-xl flex flex-col overflow-hidden">
                                <div className="p-3 border-b border-zinc-800/50 bg-indigo-500/5 flex justify-between items-center">
                                    <h3 className="font-bold text-white flex items-center text-[10px] uppercase tracking-widest">
                                        <Zap size={12} className="mr-2 text-yellow-400 fill-yellow-400" /> Live Scanning
                                    </h3>
                                    <span className="text-[9px] text-zinc-600 font-mono">Real-time</span>
                                </div>
                                <div className="p-2 space-y-2">
                                    {activeAssets.length === 0 ? (
                                        <p className="text-center text-[10px] text-zinc-500 py-4 italic">No active scan streams.</p>
                                    ) : (
                                        activeAssets.slice(0, 3).map((asset, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 bg-zinc-950/80 rounded border border-zinc-800/40">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse shrink-0" />
                                                    <div className="overflow-hidden">
                                                        <p className="text-[9px] font-mono text-zinc-300 truncate">{asset.path}</p>
                                                        <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-tighter truncate">{asset.serverName}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[9px] text-zinc-400 font-mono">{new Date(asset.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl">
                                <div className="flex items-start space-x-3 text-xs text-indigo-300">
                                    <Info size={16} className="shrink-0" />
                                    <p>Use <code className="bg-indigo-500/10 px-1 rounded text-white">{"{{log}}"}</code> as a placeholder for the log line currently being analyzed by the Sentinel engine.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Logs / Activity History */}
                <div className="xl:col-span-2 flex flex-col h-full">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center text-sm">
                                <History size={18} className="mr-2 text-zinc-400" /> AI Payload Audit Logs
                            </h3>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                showing last 50 requests
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-[#0a0a0b]">
                            {history.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale italic">
                                    <TerminalIcon size={48} className="mb-4 text-zinc-600" />
                                    <p>No activity recorded yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-800/50">
                                    {history.map((item, idx) => (
                                        <div key={idx} className="hover:bg-zinc-800/30 transition-colors group">
                                            <div
                                                className="p-4 cursor-pointer flex items-center justify-between"
                                                onClick={() => setExpandedHistory(expandedHistory === idx ? null : idx)}
                                            >
                                                <div className="flex items-center space-x-4 min-w-0">
                                                    <div className={`w-2 h-2 rounded-full ${item.response?.risk === 'HIGH' ? 'bg-red-500 animate-pulse' :
                                                        item.response?.risk === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500'
                                                        }`} />
                                                    <div className="font-mono text-[10px] text-indigo-400 font-bold uppercase tracking-tighter shrink-0 w-24 truncate">
                                                        {item.serverName}
                                                    </div>
                                                    <div className="font-mono text-[10px] text-zinc-500 shrink-0">
                                                        {new Date(item.timestamp).toLocaleTimeString()}
                                                    </div>
                                                    <div className="text-xs font-mono text-zinc-300 truncate max-w-sm">
                                                        {item.message || item.log}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-[10px] text-zinc-500 font-mono">
                                                        {item.tokens} tokens
                                                    </div>
                                                    {expandedHistory === idx ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                                                </div>
                                            </div>
                                            {expandedHistory === idx && (
                                                <div className="px-4 pb-6 pt-2 space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Processed Log</p>
                                                            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-xs text-indigo-300 whitespace-pre-wrap break-all">
                                                                {item.log}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Analysis Result</p>
                                                            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-400">
                                                                <pre>{JSON.stringify(item.response, null, 2)}</pre>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] uppercase font-bold text-zinc-500 ml-1">Full Generated Prompt</p>
                                                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-[10px] leading-relaxed text-zinc-500 whitespace-pre-wrap italic">
                                                            {item.prompt}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
