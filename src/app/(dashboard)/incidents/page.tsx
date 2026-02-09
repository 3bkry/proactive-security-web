
"use client";

import { useWebSocket } from "@/context/WebSocketContext";
import { ShieldAlert, AlertTriangle, Info, Clock, ExternalLink } from 'lucide-react';

export default function Incidents() {
    const { alerts } = useWebSocket();

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'HIGH': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    const getRiskIcon = (risk: string) => {
        switch (risk) {
            case 'HIGH': return ShieldAlert;
            case 'MEDIUM': return AlertTriangle;
            default: return Info;
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Incidents</h1>
            <p className="text-zinc-400 mb-8">Security alerts and threat detections.</p>

            <div className="space-y-4">
                {alerts.length === 0 ? (
                    <div className="p-12 text-center border border-zinc-800 rounded-lg border-dashed">
                        <ShieldAlert size={48} className="mx-auto text-zinc-600 mb-4" />
                        <h3 className="text-lg font-medium text-white">No active incidents</h3>
                        <p className="text-zinc-500">Your systems appear to be secure.</p>
                    </div>
                ) : (
                    alerts.map(alert => {
                        const Icon = getRiskIcon(alert.risk);
                        return (
                            <div key={alert.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex items-start space-x-4">
                                <div className={`p-3 rounded-md border ${getRiskColor(alert.risk)}`}>
                                    <Icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1">{alert.summary}</h3>
                                            <div className="flex items-center space-x-4 text-sm text-zinc-400">
                                                <span className="flex items-center"><Clock size={14} className="mr-1" /> {new Date(alert.timestamp).toLocaleTimeString()}</span>
                                                {alert.ip && <span className="flex items-center text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">IP: {alert.ip}</span>}
                                            </div>
                                        </div>
                                        <button className="text-zinc-500 hover:text-white"><ExternalLink size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
