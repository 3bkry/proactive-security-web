
import Link from 'next/link';
import { Check, Shield } from 'lucide-react';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navigation (Simple) */}
            <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href="/" className="flex items-center">
                            <Shield className="h-8 w-8 text-blue-500" />
                            <span className="ml-2 text-xl font-bold">ActiveSentinel</span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link href="/login" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Log in</Link>
                            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
                    <p className="text-xl text-zinc-400">Start for free, scale as you grow. No credit card required.</p>
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
    );
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
                {title === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
            </Link>
        </div>
    )
}
