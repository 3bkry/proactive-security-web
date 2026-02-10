"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { LogManagement } from "@/components/LogManagement";
import { RefreshCw } from "lucide-react";

export default function LogsPage() {
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
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading && servers.length === 0) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <RefreshCw className="h-10 w-10 animate-spin text-indigo-500/50" />
            </div>
        );
    }

    return (
        <div className="p-8 h-full flex flex-col space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Logs & Assets</h1>
                <p className="text-zinc-400">Manage security log streams and file asset watchers.</p>
            </div>

            <LogManagement
                servers={servers}
                onToggle={fetchData}
            />
        </div>
    );
}
