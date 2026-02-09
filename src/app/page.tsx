
"use client";

import { Activity, Server as ServerIcon, BrainCircuit, ShieldAlert, Terminal } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-zinc-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-2 rounded-md bg-zinc-800 text-${color}-400`}>
        <Icon size={20} />
      </div>
    </div>
    <p className="text-xs text-zinc-500">{sub}</p>
  </div>
);

export default function Overview() {
  const [servers, setServers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Mock team ID for now, in real auth we'd get this from session
      const res = await axios.get('/api/dashboard/overview');
      setServers(res.data.servers);
      setAlerts(res.data.alerts);
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const onlineCount = servers.filter(s => s.status === 'ONLINE').length;
  const totalServers = servers.length;

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cloud Dashboard</h1>
          <p className="text-zinc-400">Multi-tenant threat intelligence.</p>
        </div>
        <div className="flex space-x-3">
          <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs font-mono rounded border border-zinc-700">
            {totalServers} Managed Servers
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Servers"
          value={onlineCount}
          sub={`${onlineCount} / ${totalServers} Online`}
          icon={ServerIcon}
          color="blue"
        />
        <StatCard
          title="Security Alerts"
          value={alerts.length}
          sub="Recent Incidents"
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="AI Token Usage"
          value="1,240"
          sub="Daily Limit: 50k"
          icon={BrainCircuit}
          color="purple"
        />
        <StatCard
          title="System Load"
          value={servers.length > 0 ? (JSON.parse(servers[0].stats || '{}').cpu || 0) + '%' : "-"}
          sub="Avg. Primary Server"
          icon={Activity}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Discovered Servers</h3>
          <div className="space-y-4">
            {servers.map(server => (
              <div key={server.id} className="p-4 border border-zinc-800 rounded bg-zinc-950/50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${server.status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <div className="text-sm font-medium text-white">{server.hostname}</div>
                    <div className="text-xs text-zinc-500">{server.ip} • v{server.version}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">Last seen</div>
                  <div className="text-xs text-zinc-300 font-mono">{new Date(server.lastSeen).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            {servers.length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-sm">No servers connected. Use <code>sentinelctl connect</code> to add one.</div>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded text-left flex items-center text-zinc-400 cursor-not-allowed">
              <Terminal size={16} className="mr-2" /> Open Terminal (Coming Soon)
            </button>
            <Link href="/ai" className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium rounded text-left flex items-center">
              <BrainCircuit size={16} className="mr-2" /> Global AI Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
