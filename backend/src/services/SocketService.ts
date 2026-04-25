import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import configs from "../config/configs.js";
import { ChatService } from "./ChatService.js";

export class SocketService {
    private static io: SocketIOServer;
    private static userSockets = new Map<number, string>();

    static initialize(server: HTTPServer) {
        this.io = new SocketIOServer(server, {
            cors: { origin: "*", methods: ["GET", "POST"] }
        });

        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token) return next(new Error("Authentication error"));

            try {
                const decoded = jwt.verify(token, configs.JWT_SECRET!) as any;
                const userId = decoded.id;
                (socket as any).userId = userId;
                this.userSockets.set(userId, socket.id);
                socket.join(`user_${userId}`);
                next();
            } catch (err) {
                next(new Error("Authentication error"));
            }
        });

        this.io.on("connection", (socket) => {
            const userId = (socket as any).userId;
            console.log(`[Socket] User connected: ${userId} (${socket.id})`);

            socket.on("join_conversation", (conversationId: number) => {
                socket.join(`conversation_${conversationId}`);
            });

            socket.on("join_community_group", (groupId: number) => {
                socket.join(`group_${groupId}`);
            });

            socket.on("leave_community_group", (groupId: number) => {
                socket.leave(`group_${groupId}`);
            });

            socket.on("community_message", async (data) => {
                try {
                    const { CommunityService } = await import("./CommunityService.js");
                    const message = await CommunityService.sendMessage(data.groupId, userId, data);
                    this.io.to(`group_${data.groupId}`).emit("new_community_message", { message });
                } catch (err: any) {
                    socket.emit("error", { message: err.message });
                }
            });

            socket.on("typing", (data: { groupId: number; isTyping: boolean }) => {
                socket.to(`group_${data.groupId}`).emit("user_typing", { userId, isTyping: data.isTyping });
            });

            socket.on("disconnect", () => {
                console.log(`[Socket] User disconnected: ${userId}`);
                this.userSockets.delete(userId);
            });
        });

        (global as any).socketIOInstance = this.io;
        return this.io;
    }

    static getIO(): SocketIOServer {
        if (!this.io) throw new Error("Socket.io not initialized");
        return this.io;
    }
}