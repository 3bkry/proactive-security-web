
"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface ServerStats {
    hostname: string;
    platform: string;
    arch: string;
    cpus: number;
    memory: string;
    uptime: number;
    status: 'online' | 'offline';
    lastHeartbeat: number;
}

interface Alert {
    id: string;
    risk: string;
    summary: string;
    ip?: string;
    timestamp: number;
}

interface WebSocketContextType {
    socket: WebSocket | null;
    serverStats: ServerStats | null;
    alerts: Alert[];
    terminalData: string;
    sendMessage: (msg: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [serverStats, setServerStats] = useState<ServerStats | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [terminalData, setTerminalData] = useState<string>("");
    const reconnectTimeout = useRef<NodeJS.Timeout>();

    const connect = () => {
        const ws = new WebSocket("ws://127.0.0.1:8081");

        ws.onopen = () => {
            console.log("Connected to Sentinel Agent");
            setSocket(ws);
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "terminal") {
                    setTerminalData(prev => prev + msg.data);
                } else if (msg.type === "alert") {
                    const newAlert = { ...msg.data, id: Date.now().toString(), timestamp: Date.now() };
                    setAlerts(prev => [newAlert, ...prev]);
                } else if (msg.type === "heartbeat") {
                    setServerStats(prev => ({
                        ...prev,
                        ...msg.data,
                        status: 'online',
                        lastHeartbeat: Date.now()
                    }));
                } else if (msg.type === "identity") {
                    setServerStats(prev => ({
                        ...prev,
                        ...msg.data,
                        status: 'online',
                        lastHeartbeat: Date.now()
                    }));
                }
            } catch (e) {
                console.error("Error parsing WS message:", e);
            }
        };

        ws.onclose = () => {
            console.log("Disconnected. Reconnecting...");
            setSocket(null);
            setServerStats(prev => prev ? { ...prev, status: 'offline' } : null);
            reconnectTimeout.current = setTimeout(connect, 3000);
        };
    };

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            socket?.close();
        };
    }, []);

    const sendMessage = (msg: any) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(msg));
        }
    };

    return (
        <WebSocketContext.Provider value={{ socket, serverStats, alerts, terminalData, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) throw new Error("useWebSocket must be used within a WebSocketProvider");
    return context;
};
