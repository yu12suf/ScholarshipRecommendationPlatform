import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import configs from "../config/configs.js";
import { ChatService } from "./ChatService.js";

export class SocketService {
    private static io: SocketIOServer;
    private static userSockets = new Map<number, string>(); // userId -> socketId

    static initialize(server: HTTPServer) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: "*", // Adjust in production
                methods: ["GET", "POST"]
            }
        });

        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token) return next(new Error("Authentication error"));

            try {
                const decoded = jwt.verify(token, configs.JWT_SECRET!) as any;
                (socket as any).userId = decoded.id;
                next();
            } catch (err) {
                next(new Error("Authentication error"));
            }
        });

        this.io.on("connection", (socket) => {
            const userId = (socket as any).userId;
            console.log(`[Socket] User connected: ${userId} (${socket.id})`);
            this.userSockets.set(userId, socket.id);

            socket.on("join_conversation", (conversationId: number) => {
                socket.join(`conversation_${conversationId}`);
                console.log(`[Socket] User ${userId} joined conversation ${conversationId}`);
            });

            socket.on("send_message", async (data: { conversationId: number; receiverId: number; content: string }) => {
                try {
                    const message = await ChatService.sendMessage(data.conversationId, userId, data.content);
                    
                    // Broadcast to the conversation room
                    this.io.to(`conversation_${data.conversationId}`).emit("receive_message", message);
                    
                    // Also notify the receiver specifically if they are not in the room? 
                    // Room handle it mostly, but for "new message" alerts:
                    const receiverSocketId = this.userSockets.get(data.receiverId);
                    if (receiverSocketId) {
                        this.io.to(receiverSocketId).emit("new_message_alert", {
                            conversationId: data.conversationId,
                            senderName: (message as any).sender.name,
                            content: data.content
                        });
                    }
                } catch (err) {
                    console.error("[Socket] send_message error:", err);
                }
            });

            socket.on("typing", (data: { conversationId: number; isTyping: boolean }) => {
                socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
                    userId,
                    isTyping: data.isTyping
                });
            });

            socket.on("disconnect", () => {
                console.log(`[Socket] User disconnected: ${userId}`);
                this.userSockets.delete(userId);
            });
        });

        return this.io;
    }

    static getIO() {
        if (!this.io) throw new Error("Socket.io not initialized");
        return this.io;
    }
}
