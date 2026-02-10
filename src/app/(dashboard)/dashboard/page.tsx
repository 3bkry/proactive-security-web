"use client";

import {
  Server, Shield, Zap, AlertTriangle, RefreshCw, ChevronRight, Gauge,
  ShieldCheck, BrainCircuit, Activity, Terminal, Lock, Clock, Search, FileText,
  Copy, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { LogManagement } from '@/components/LogManagement';

const StatCard = ({ title, value, sub, icon: Icon, color, trend }: any) => (
  <div className="group relative overflow-hidden bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={120} />
    </div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-zinc-400 text-sm font-medium tracking-tight uppercase">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1 font-mono tracking-tighter">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">{sub}</p>
        {trend && <span className={`text-xs font-bold ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>}
      </div>
    </div>
  </div>
);

const ThresholdModal = ({ server, onClose, onSave }: any) => {
  const [thresholds, setThresholds] = useState({
    cpu: server.cpuThreshold,
    memory: server.memThreshold,
    disk: server.diskThreshold
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`/api/servers/${server.id}/config`, {
        cpuThreshold: thresholds.cpu,
        memThreshold: thresholds.memory,
        diskThreshold: thresholds.disk
      });
      onSave();
      onClose();
    } catch (e) {
      alert("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Gauge size={20} className="text-indigo-400" /> Sensor Configuration
        </h3>
        <p className="text-xs text-zinc-500 mb-6 uppercase tracking-wider font-bold">Adjusting thresholds for {server.hostname}</p>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="text-zinc-400">CPU Alert Threshold</label>
              <span className="text-white font-mono">{thresholds.cpu}%</span>
            </div>
            <input
              type="range" min="1" max="100"
              value={thresholds.cpu}
              onChange={(e) => setThresholds({ ...thresholds, cpu: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="text-zinc-400">Memory Alert Threshold</label>
              <span className="text-white font-mono">{thresholds.memory}%</span>
            </div>
            <input
              type="range" min="1" max="100"
              value={thresholds.memory}
              onChange={(e) => setThresholds({ ...thresholds, memory: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="text-zinc-400">Disk Alert Threshold</label>
              <span className="text-white font-mono">{thresholds.disk}%</span>
            </div>
            <input
              type="range" min="1" max="100"
              value={thresholds.disk}
              onChange={(e) => setThresholds({ ...thresholds, disk: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            {saving ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
            {saving ? 'Syncing...' : 'Deploy Config'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ServerHealthRow = ({ server, onConfigClick }: { server: any, onConfigClick: () => void }) => {
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

  const getStatusColor = (val: number, threshold: number) => {
    if (val > threshold + 10) return "text-rose-500";
    if (val > threshold) return "text-amber-500";
    return "text-indigo-400";
  };

  return (
    <div className="group p-4 border border-zinc-800 rounded-xl bg-zinc-950/40 hover:bg-zinc-900/60 transition-all flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl border ${server.status === 'ONLINE' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          <Server size={18} />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">{server.hostname}</h4>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1"><Terminal size={10} /> v{server.version}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            <span>{server.ip}</span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <div className="w-24 cursor-pointer hover:scale-105 transition-transform" onClick={onConfigClick}>
          <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
            <span className="uppercase tracking-tighter">CPU</span>
            <span className={getStatusColor(stats.cpu, server.cpuThreshold)}>{Math.round(stats.cpu)}%</span>
          </div>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${stats.cpu > server.cpuThreshold ? 'bg-rose-500' : 'bg-indigo-500'}`}
              style={{ width: `${stats.cpu}%` }}
            />
          </div>
        </div>
        <div className="w-24 cursor-pointer hover:scale-105 transition-transform" onClick={onConfigClick}>
          <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
            <span className="uppercase tracking-tighter">MEM</span>
            <span className={getStatusColor(stats.memory, server.memThreshold)}>{Math.round(stats.memory)}%</span>
          </div>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${stats.memory > server.memThreshold ? 'bg-rose-500' : 'bg-indigo-500'}`}
              style={{ width: `${stats.memory}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-xs text-zinc-300 font-mono tracking-tighter">{Math.floor((stats.uptime || 0) / 3600)}h {Math.floor(((stats.uptime || 0) % 3600) / 60)}m</div>
        <button onClick={onConfigClick} className="p-2.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all border border-transparent hover:border-indigo-500/20">
          <Gauge size={18} />
        </button>
        <Link href={`/servers/${server.id}`} className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all">
          <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  );
};



export default function Overview() {
  const { data: session } = useSession();
  const [servers, setServers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [aiStats, setAiStats] = useState({ used: 0, limit: 100000 });
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [configServer, setConfigServer] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/dashboard/overview');
      setServers(res.data.servers);
      setAlerts(res.data.alerts);
      setApiKey(res.data.apiKey);
      if (res.data.aiStats) setAiStats(res.data.aiStats);

      if (res.data.servers.length === 0) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    } catch (e) { } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
      const interval = setInterval(() => { if (session) fetchData() }, 5000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading && servers.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <RefreshCw className="h-10 w-10 animate-spin text-indigo-500/50" />
      </div>
    );
  }

  const aiProgress = (aiStats.used / aiStats.limit) * 100;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">SYSTEM NEXUS</h1>
          <p className="text-zinc-500 font-medium">Infrastructure Command & AI Defense Nexus</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-shadow-sm">Cloud Uplink Active</span>
          </div>
          <button
            onClick={fetchData}
            className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-all active:scale-95 shadow-lg"
          >
            <RefreshCw className={`h-5 w-5 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {showOnboarding && (
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-black p-1">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent"></div>
          <div className="relative z-10 bg-zinc-950/80 p-10 rounded-[calc(1.5rem-1px)] backdrop-blur-3xl">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1">
                <div className="inline-flex p-3 bg-indigo-500/20 rounded-2xl mb-6">
                  <Zap className="h-8 w-8 text-indigo-400" strokeWidth={2.5} />
                </div>
                <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">Initialize Your Network</h2>
                <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-xl">
                  Deploy the SentinelAI satellite agent to unlock real-time neural protection and infrastructure analytics.
                  It takes less than 60 seconds to secure your first node.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full text-zinc-300 text-sm border border-zinc-800">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" /> End-to-end Encrypted
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full text-zinc-300 text-sm border border-zinc-800">
                    <Activity className="h-4 w-4 text-amber-400" /> &lt; 1% CPU Overhead
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[450px] space-y-6">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">1. Quick Install</h3>
                  <div className="bg-black rounded-xl p-4 border border-zinc-800 font-mono text-sm relative group">
                    <code className="text-indigo-300 text-xs block pr-8">
                      curl -fsSL sentinelai.sh/install | sudo bash
                    </code>
                    <button onClick={() => copyToClipboard('curl -fsSL https://raw.githubusercontent.com/3bkry/proactive-security/main/install.sh | sudo bash')} className="absolute right-3 top-4 text-zinc-600 hover:text-white">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">2. Authenticate</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-4 py-3 bg-black rounded-xl border border-zinc-800">
                      <span className="text-xs font-mono text-zinc-400 truncate max-w-[200px]">{apiKey || '••••••••••••••••'}</span>
                      <button onClick={() => copyToClipboard(apiKey || '')} className="text-zinc-600 hover:text-white"><Copy size={16} /></button>
                    </div>
                    <button
                      onClick={fetchData}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
                      Verify Connection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Nodes" value={servers.length} sub={`${servers.filter(s => s.status === 'ONLINE').length} online`} icon={Server} color="blue" />
        <StatCard title="Active Threats" value={alerts.length} sub="Filtered by AI" icon={ShieldAlert} color="rose" trend={+12} />
        <StatCard title="Neural Usage" value={`${Math.round(aiProgress)}%`} sub={`${aiStats.used.toLocaleString()} tokens`} icon={BrainCircuit} color="indigo" />
        <StatCard title="Health Score" value="98%" sub="System wide" icon={Activity} color="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Server Health List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Server className="text-indigo-400" size={20} /> Infrastructure Status
                </h2>
                <p className="text-xs text-zinc-500 mt-1">Real-time telemetry from heartbeat satellites</p>
              </div>
              <Link href="/servers" className="text-xs font-bold text-indigo-400 hover:text-indigo-3100 transition-colors uppercase tracking-widest">
                View All Servers
              </Link>
            </div>
            <div className="space-y-3">
              {servers.map(server => (
                <ServerHealthRow
                  key={server.id}
                  server={server}
                  onConfigClick={() => setConfigServer(server)}
                />
              ))}
              {servers.length === 0 && !loading && (
                <div className="py-12 text-center">
                  <div className="p-4 bg-zinc-900 rounded-full w-fit mx-auto mb-4 border border-zinc-800">
                    <Server className="h-8 w-8 text-zinc-700" />
                  </div>
                  <p className="text-zinc-500 font-medium">No tactical nodes detected in the network.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights Page Section (Coming from /ai page context) */}
          <div className="bg-indigo-500/5 rounded-2xl border border-indigo-500/10 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BrainCircuit size={100} className="text-indigo-400" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Neural Analysis Center</h3>
                <p className="text-sm text-zinc-400 max-w-md">Our AI is actively analyzing logs for zero-day vulnerabilities and automated bruteforce patterns.</p>
              </div>
              <Link href="/ai" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 whitespace-nowrap">
                Neural Dashboard
              </Link>
            </div>
          </div>

          <LogManagement
            servers={servers}
            onToggle={fetchData}
          />
        </div>

        {/* Sidebar: Alerts & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-8 backdrop-blur-md h-full">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <ShieldAlert className="text-rose-400" size={20} /> Tactical Alerts
            </h2>
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className="p-4 rounded-xl bg-black/40 border-l-2 border-rose-500/50 hover:bg-black/60 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{alert.risk} THREAT</span>
                    <span className="text-[10px] text-zinc-600 font-mono italic">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-zinc-300 font-medium leading-tight">{alert.summary}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono">{alert.ip || 'INTERNAL'}</span>
                    <Link href="/incidents" className="text-[10px] text-indigo-400 hover:underline">Details →</Link>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="py-12 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-2xl">
                  <ShieldCheck size={24} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs uppercase font-bold tracking-widest">No Active Threats</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {configServer && (
        <ThresholdModal
          server={configServer}
          onClose={() => setConfigServer(null)}
          onSave={fetchData}
        />
      )}
    </div>
  );
}
