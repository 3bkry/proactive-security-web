"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import axios from "axios";

export default function Terminal() {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const [status, setStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("connecting");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        // Initialize xterm.js
        const term = new XTerm({
            cursorBlink: true,
            theme: {
                background: "#0f0f0f",
                foreground: "#a1a1aa", // zinc-400
                cursor: "#6366f1", // indigo-500
            },
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: 14,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;

        // Fetch primary server to connect to
        const connectToAgent = async () => {
            try {
                const res = await axios.get('/api/dashboard/overview');
                const servers = res.data.servers;
                const activeServer = servers.find((s: any) => s.status === "ONLINE");

                if (!activeServer) {
                    setStatus("disconnected");
                    setError("No active servers found to connect terminal.");
                    return;
                }

                if (!activeServer.wsPort) {
                    setStatus("error");
                    setError("Server is online but does not support Live Terminal (missing port).");
                    return;
                }

                // Connect to Agent WebSocket
                const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
                // Use the server's IP if it's public, otherwise assume localhost for dev
                const host = activeServer.ip || "localhost";
                const wsUrl = `${protocol}//${host}:${activeServer.wsPort}`;

                console.log(`[Terminal] Connecting to agent at ${wsUrl}`);
                const socket = new WebSocket(wsUrl);
                socketRef.current = socket;

                socket.onopen = () => {
                    setStatus("connected");
                    term.writeln("\x1b[32m✔ Connected to Sentinel Agent shell\x1b[37m");
                    term.writeln("");
                };

                socket.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);
                        if (msg.type === "terminal") {
                            term.write(msg.data);
                        }
                    } catch (e) {
                        term.write(event.data);
                    }
                };

                socket.onclose = () => {
                    setStatus("disconnected");
                    term.writeln("\r\n\x1b[31mConnection closed.\x1b[37m");
                };

                socket.onerror = () => {
                    setStatus("error");
                    setError("Could not connect to agent WebSocket. Ensure port is reachable.");
                };

                term.onData((data) => {
                    if (socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ type: "terminal", data }));
                    }
                });

            } catch (e: any) {
                console.error("[Terminal] Connection error:", e);
                setStatus("error");
                setError(e.message || "Failed to fetch server information.");
            }
        };

        connectToAgent();

        const handleResize = () => fitAddon.fit();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            term.dispose();
            if (socketRef.current) socketRef.current.close();
        };
    }, []);

    return (
        <div className="w-full h-full relative group">
            <div ref={terminalRef} className="w-full h-full" />

            {/* Status Overlay */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 px-3 py-1 bg-black/50 backdrop-blur border border-zinc-800 rounded text-xs">
                <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' :
                        status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                            'bg-red-500'
                    }`} />
                <span className="text-zinc-300 capitalize">{status}</span>
            </div>

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8 text-center">
                    <div className="max-w-md">
                        <p className="text-red-400 font-bold mb-2">Terminal Error</p>
                        <p className="text-zinc-500 text-sm">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
