import { FileText, AlertTriangle } from 'lucide-react';

export default function LogsPage() {
    return (
        <div className="p-8 h-full flex flex-col items-center justify-center space-y-6 text-center">
            <div className="p-6 bg-zinc-900/50 rounded-full border border-zinc-800">
                <FileText size={64} className="text-zinc-600" />
            </div>
            <div className="space-y-2 max-w-lg">
                <h1 className="text-2xl font-bold text-white">Log Streaming Unavailable</h1>
                <p className="text-zinc-400">
                    Real-time log streaming is currently disabled in the Cloud Dashboard for security reasons.
                    Please specific logs will be uploaded as part of Incident Reports.
                </p>
            </div>
            <div className="flex items-center space-x-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20 text-sm">
                <AlertTriangle size={16} />
                <span>Use `sentinelctl watch &lt;file&gt;` on your server to stream logs locally.</span>
            </div>
        </div>
    );
}
