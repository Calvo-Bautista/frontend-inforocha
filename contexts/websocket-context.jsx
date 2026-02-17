"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/api";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const [lastMessage, setLastMessage] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = () => {
        try {
            // Replace http/https with ws/wss
            let wsUrl = API_URL.replace(/^http/, "ws");
            // Ensure no double slash between base and endpoint, but preserve protocol slash
            if (wsUrl.endsWith("/")) {
                wsUrl = wsUrl.slice(0, -1);
            }
            wsUrl += "/ws";

            console.log("Connecting to WebSocket:", wsUrl);

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("WebSocket Connected");
                setIsConnected(true);
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage(data);
                } catch (err) {
                    console.error("Error parsing WebSocket message:", err);
                }
            };

            ws.onclose = (event) => {
                console.log("WebSocket Disconnected", event.code, event.reason);
                setIsConnected(false);
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 3000);
            };

            ws.onerror = (error) => {
                console.error("WebSocket Error:", error);
                ws.close();
            };
        } catch (error) {
            console.error("WebSocket Connection Error:", error);
        }
    };

    useEffect(() => {
        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ lastMessage, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
}
