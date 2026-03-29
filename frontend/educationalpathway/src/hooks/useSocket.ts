"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const useSocket = (token: string | null) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            query: { token }
        });

        socketRef.current.on("connect", () => {
            console.log("[Socket] Connected to server");
            setIsConnected(true);
        });

        socketRef.current.on("disconnect", () => {
            console.log("[Socket] Disconnected from server");
            setIsConnected(false);
        });

        socketRef.current.on("connect_error", (err) => {
            console.error("[Socket] Connection error:", err.message);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [token]);

    return { socket: socketRef.current, isConnected };
};
