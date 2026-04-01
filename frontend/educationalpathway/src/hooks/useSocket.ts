"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const useSocket = (token: string | null) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        console.log("[Socket] Attempting connection to:", SOCKET_URL);

        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket"],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: true,
        });

        socketRef.current.on("connect", () => {
            console.log("[Socket] Connected to server:", socketRef.current?.id);
            setIsConnected(true);
        });

        socketRef.current.on("disconnect", (reason) => {
            console.log("[Socket] Disconnected from server. Reason:", reason);
            setIsConnected(false);
        });

        socketRef.current.on("connect_error", (err) => {
            console.error("[Socket] Connection error details:", err);
            setIsConnected(false);
        });

        return () => {
            if (socketRef.current) {
                console.log("[Socket] Cleaning up connection...");
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [token]);

    return { socket: socketRef.current, isConnected };
};
