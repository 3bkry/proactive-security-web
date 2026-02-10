
"use client";

import React from 'react';
import {
    ShieldAlert,
    LayoutDashboard,
    Server,
    BrainCircuit,
    Activity,
    Settings,
    Terminal,
    FileText,
    ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const NavItem = ({ href, icon: Icon, label, active }: any) => (
    <Link href={href} className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </Link>
);

export const Sidebar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <div className="w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col">
            <div className="p-6 flex items-center space-x-3 border-b border-zinc-800">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <ShieldAlert className="text-blue-500" size={28} />
                    <span className="text-xl font-bold text-white tracking-tight">Active<span className="text-blue-500">Sentinel</span></span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-4">Platform</div>
                <NavItem href="/dashboard" icon={LayoutDashboard} label="Overview" active={pathname === '/dashboard'} />
                <NavItem href="/servers" icon={Server} label="Servers" active={pathname === '/servers'} />
                <NavItem href="/logs" icon={FileText} label="Logs" active={pathname === '/logs'} />
                <NavItem href="/ai" icon={BrainCircuit} label="AI Insights" active={pathname === '/ai'} />
                <NavItem href="/incidents" icon={Activity} label="Incidents" active={pathname === '/incidents'} />
                <NavItem href="/defense" icon={ShieldCheck} label="Active Defense" active={pathname === '/defense'} />

                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-8 mb-4 px-4">Tools</div>
                <NavItem href="/terminal" icon={Terminal} label="Live Terminal" active={pathname === '/terminal'} />
                <NavItem href="/settings" icon={Settings} label="Settings" active={pathname === '/settings'} />
            </nav>

            <div className="p-4 border-t border-zinc-800">
                <div className="flex items-center space-x-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {session?.user?.name?.[0] || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-sm font-medium text-white truncate">{session?.user?.name || 'User'}</div>
                        <button onClick={() => signOut()} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">Sign Out</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
