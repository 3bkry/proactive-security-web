
"use client";

import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-zinc-400 mb-8">Configure agent behavior and notification preferences.</p>

            <div className="space-y-6 max-w-2xl">

                {/* General Settings */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <SettingsIcon size={20} className="mr-2" /> General
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Server Name</label>
                            <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500" defaultValue="prod-api-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Heartbeat Interval (seconds)</label>
                            <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500" defaultValue="30" />
                        </div>
                    </div>
                </div>

                {/* AI Configuration */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <RefreshCw size={20} className="mr-2" /> AI Configuration
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Model</label>
                            <select className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500">
                                <option>Gemini 1.5 Flash (Latest)</option>
                                <option>Gemini 1.5 Pro</option>
                                <option>GPT-4o</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Max Tokens per Day</label>
                            <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500" defaultValue="50000" />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button className="flex items-center bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-md font-medium transition-colors">
                        <Save size={18} className="mr-2" /> Save Changes
                    </button>
                </div>

            </div>
        </div>
    );
}
