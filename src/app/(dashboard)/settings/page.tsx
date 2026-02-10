
"use client";

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const [config, setConfig] = useState({
        aiProvider: 'gemini',
        geminiApiKey: '',
        openaiApiKey: '',
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await axios.get('/api/ai/config');
                setConfig({
                    aiProvider: response.data.aiProvider || 'gemini',
                    geminiApiKey: response.data.geminiApiKey || '',
                    openaiApiKey: response.data.openaiApiKey || '',
                });
            } catch (error) {
                console.error("Failed to fetch settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            await axios.post('/api/ai/config', config);
            setStatus({ type: 'success', message: 'Settings saved successfully' });
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <RefreshCw className="animate-spin text-zinc-500" size={32} />
            </div>
        );
    }

    return (
        <div className="p-8 pb-20">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-zinc-400 mb-8">Configure agent behavior and notification preferences.</p>

            <div className="space-y-6 max-w-2xl">
                {/* AI Configuration */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-xl">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <RefreshCw size={20} className="mr-2 text-indigo-400" /> AI Neural Center
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Primary AI Provider</label>
                            <select
                                value={config.aiProvider}
                                onChange={(e) => setConfig({ ...config, aiProvider: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="gemini">Google Gemini (3 Flash Preview)</option>
                                <option value="openai">OpenAI (GPT-4o)</option>
                            </select>
                        </div>

                        {config.aiProvider === 'gemini' && (
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Gemini API Key</label>
                                <input
                                    type="password"
                                    placeholder="Enter your Google Gemini API Key"
                                    value={config.geminiApiKey}
                                    onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                />
                                <p className="text-xs text-zinc-500 mt-2">Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-indigo-400 hover:underline">Google AI Studio</a></p>
                            </div>
                        )}

                        {config.aiProvider === 'openai' && (
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">OpenAI API Key</label>
                                <input
                                    type="password"
                                    placeholder="Enter your GPT-4 API Key"
                                    value={config.openaiApiKey}
                                    onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                />
                                <p className="text-xs text-zinc-500 mt-2">Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" className="text-indigo-400 hover:underline">OpenAI Dashboard</a></p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Message */}
                {status && (
                    <div className={`p-4 rounded-lg flex items-center ${status.type === 'success' ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900' : 'bg-red-950/30 text-red-400 border border-red-900'}`}>
                        {status.type === 'success' ? <CheckCircle size={18} className="mr-2" /> : <AlertCircle size={18} className="mr-2" />}
                        {status.message}
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95"
                    >
                        {saving ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
                        {saving ? 'Saving...' : 'Save AI Configuration'}
                    </button>
                </div>

            </div>
        </div>
    );
}
