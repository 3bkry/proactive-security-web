
import Link from 'next/link';
import { Shield, Zap, Lock, Globe, Server, Check } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navigation */}
            <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-blue-500" />
                            <span className="ml-2 text-xl font-bold">ActiveSentinel</span>
                        </div>
                        <div className="hidden md:flex space-x-8">
                            <a href="#features" className="text-zinc-400 hover:text-white transition-colors">Features</a>
                            <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors">Pricing</a>
                            <a href="https://github.com/3bkry/proactive-security" className="text-zinc-400 hover:text-white transition-colors">GitHub</a>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/login" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Log in</Link>
                            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-8">
                    <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
                    Now Available in Public Beta
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                    Server Security for the <br className="hidden md:block" /> AI Era
                </h1>
                <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
                    Proactive threat detection, real-time blocking, and AI-powered analysis for your infrastructure. Deploy in seconds.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition-colors flex items-center justify-center">
                        Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <a href="https://github.com/3bkry/proactive-security" className="px-8 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-lg font-medium text-lg transition-colors flex items-center justify-center">
                        View on GitHub
                    </a>
                </div>

                {/* Hero Image / Viz */}
                <div className="mt-16 relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl aspect-[16/9] overflow-hidden flex items-center justify-center">
                        <div className="text-zinc-500">
                            {/* Placeholder for dashboard screenshot */}
                            <span className="text-sm">Interactive Dashboard Preview</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div id="features" className="py-20 bg-zinc-950/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything you need to secure your fleet</h2>
                        <p className="text-zinc-400">Built for developers who value performance and peace of mind.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Zap}
                            title="Real-time Blocking"
                            desc="Automatically bans malicious IPs attacking your server in milliseconds using iptables."
                        />
                        <FeatureCard
                            icon={Globe}
                            title="Global Intelligence"
                            desc="Share threat data across your entire fleet. If one server is attacked, all are protected."
                        />
                        <FeatureCard
                            icon={Lock}
                            title="Zero Trust Architecture"
                            desc="Agents communicate via secure, authenticated channels. No open ports required."
                        />
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div id="pricing" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
                        <p className="text-zinc-400">Start for free, scale as you grow.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <PricingCard
                            title="Developer"
                            price="$0"
                            features={['1 Server', 'Basic AI Analysis', 'Community Support', '7-day Log Retention']}
                        />
                        <PricingCard
                            title="Pro"
                            price="$29"
                            period="/mo"
                            featured={true}
                            features={['10 Servers', 'Advanced AI Insights', 'Priority Support', '30-day Log Retention', 'Slack & Telegram Alerts']}
                        />
                        <PricingCard
                            title="Enterprise"
                            price="Custom"
                            features={['Unlimited Servers', 'Custom AI Models', 'SLA Support', '90-day Log Retention', 'SSO & Audit Logs']}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-zinc-800 py-12 bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                        <Shield className="h-6 w-6 text-zinc-500" />
                        <span className="ml-2 text-zinc-500 font-medium">ActiveSentinel</span>
                    </div>
                    <div className="text-zinc-600 text-sm">
                        &copy; 2026 SentinelAI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
    return (
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-blue-500/50 transition-colors">
            <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-zinc-400 leading-relaxed">{desc}</p>
        </div>
    )
}

function PricingCard({ title, price, period, features, featured }: any) {
    return (
        <div className={`p-8 rounded-xl border ${featured ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-800 bg-zinc-900'} relative flex flex-col`}>
            {featured && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    MOST POPULAR
                </div>
            )}
            <h3 className="text-lg font-medium text-zinc-300 mb-2">{title}</h3>
            <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-bold text-white">{price}</span>
                {period && <span className="text-zinc-500 ml-1">{period}</span>}
            </div>
            <ul className="space-y-4 mb-8 flex-1">
                {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center text-zinc-400 text-sm">
                        <Check className="h-4 w-4 text-blue-500 mr-3 shrink-0" />
                        {f}
                    </li>
                ))}
            </ul>
            <Link href="/login" className={`block w-full py-3 text-center rounded-lg font-medium transition-colors ${featured ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
                Get Started
            </Link>
        </div>
    )
}

import { ArrowRight } from 'lucide-react';
