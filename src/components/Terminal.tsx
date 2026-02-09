"use client";

import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { useWebSocket } from "@/context/WebSocketContext";

export default function Terminal() {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const { socket, terminalData, sendMessage } = useWebSocket();
    const processedLength = useRef(0);

    // Initialize Terminal
    useEffect(() => {
        if (!terminalRef.current || xtermRef.current) return;

        const term = new XTerm({
            cursorBlink: true,
            theme: {
                background: "#0f0f0f",
                foreground: "#f0f0f0",
            },
            fontFamily: '"JetBrains Mono", monospace',
            allowProposedApi: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);

        const fitCheck = () => {
            if (!terminalRef.current || !xtermRef.current) return;
            try { fitAddon.fit(); } catch (e) { }
        };

        const resizeObserver = new ResizeObserver(() => requestAnimationFrame(fitCheck));
        resizeObserver.observe(terminalRef.current);
        setTimeout(fitCheck, 100);

        xtermRef.current = term;

        // Handle Input
        term.onData((data) => {
            sendMessage({ type: "terminal", data });
        });

        return () => {
            resizeObserver.disconnect();
            term.dispose();
            xtermRef.current = null;
        };
    }, []); // Run once

    // Sync Data from Context
    useEffect(() => {
        if (!xtermRef.current || !terminalData) return;

        // Only write new data
        if (terminalData.length > processedLength.current) {
            const newData = terminalData.substring(processedLength.current);
            xtermRef.current.write(newData);
            processedLength.current = terminalData.length;
        }
    }, [terminalData]);

    // Handle Socket Connection State
    useEffect(() => {
        if (socket && xtermRef.current) {
            xtermRef.current.writeln("\x1b[32mConnected to Sentinel Agent...\x1b[0m");
        }
    }, [socket]);

    return (
        <div
            ref={terminalRef}
            className="w-full h-full min-h-[500px] border border-gray-800 rounded-lg overflow-hidden bg-[#0f0f0f]"
        />
    );
}
