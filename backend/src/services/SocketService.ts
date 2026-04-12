import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import configs from "../config/configs.js";
import { ChatService } from "./ChatService.js";

interface VideoCallRoom {
    bookingId: number;
    participants: Set<string>;
    startTime: Date;
}

export class SocketService {
    private static io: SocketIOServer;
    private static userSockets = new Map<number, string>();
    private static videoCallRooms = new Map<number, VideoCallRoom>();

    static initialize(server: HTTPServer) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: "*",
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
                    
                    this.io.to(`conversation_${data.conversationId}`).emit("receive_message", message);
                    
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

            socket.on("join_video_call", (data: { bookingId: number }) => {
                const roomKey = data.bookingId;
                
                if (!this.videoCallRooms.has(roomKey)) {
                    this.videoCallRooms.set(roomKey, {
                        bookingId: data.bookingId,
                        participants: new Set(),
                        startTime: new Date()
                    });
                }
                
                const room = this.videoCallRooms.get(roomKey)!;
                room.participants.add(socket.id);
                
                socket.join(`video_call_${roomKey}`);
                console.log(`[Socket] User ${userId} joined video call for booking ${data.bookingId}`);
                
                socket.to(`video_call_${roomKey}`).emit("participant_joined", {
                    bookingId: data.bookingId,
                    userId: userId,
                    socketId: socket.id,
                    participants: Array.from(room.participants)
                });
            });

            socket.on("leave_video_call", (data: { bookingId: number }) => {
                const roomKey = data.bookingId;
                const room = this.videoCallRooms.get(roomKey);
                
                if (room) {
                    room.participants.delete(socket.id);
                    
                    socket.leave(`video_call_${roomKey}`);
                    console.log(`[Socket] User ${userId} left video call for booking ${data.bookingId}`);
                    
                    socket.to(`video_call_${roomKey}`).emit("participant_left", {
                        bookingId: data.bookingId,
                        userId: userId,
                        socketId: socket.id,
                        participants: Array.from(room.participants)
                    });
                    
                    if (room.participants.size === 0) {
                        this.videoCallRooms.delete(roomKey);
                        console.log(`[Socket] Video call room ${data.bookingId} cleaned up (no participants)`);
                    }
                }
            });

            socket.on("webrtc_offer", (data: { bookingId: number; targetSocketId: string; offer: any }) => {
                console.log(`[Socket] WebRTC offer from ${userId} to ${data.targetSocketId}`);
                this.io.to(data.targetSocketId).emit("webrtc_offer", {
                    bookingId: data.bookingId,
                    fromSocketId: socket.id,
                    fromUserId: userId,
                    offer: data.offer
                });
            });

            socket.on("webrtc_answer", (data: { bookingId: number; targetSocketId: string; answer: any }) => {
                console.log(`[Socket] WebRTC answer from ${userId} to ${data.targetSocketId}`);
                this.io.to(data.targetSocketId).emit("webrtc_answer", {
                    bookingId: data.bookingId,
                    fromSocketId: socket.id,
                    fromUserId: userId,
                    answer: data.answer
                });
            });

            socket.on("webrtc_ice_candidate", (data: { bookingId: number; targetSocketId: string; candidate: any }) => {
                this.io.to(data.targetSocketId).emit("webrtc_ice_candidate", {
                    bookingId: data.bookingId,
                    fromSocketId: socket.id,
                    fromUserId: userId,
                    candidate: data.candidate
                });
            });

            socket.on("toggle_video", (data: { bookingId: number; enabled: boolean }) => {
                socket.to(`video_call_${data.bookingId}`).emit("video_toggled", {
                    userId: userId,
                    socketId: socket.id,
                    enabled: data.enabled
                });
            });

            socket.on("toggle_audio", (data: { bookingId: number; enabled: boolean }) => {
                socket.to(`video_call_${data.bookingId}`).emit("audio_toggled", {
                    userId: userId,
                    socketId: socket.id,
                    enabled: data.enabled
                });
            });

            socket.on("disconnect", () => {
                console.log(`[Socket] User disconnected: ${userId}`);
                
                this.videoCallRooms.forEach((room, bookingId) => {
                    if (room.participants.has(socket.id)) {
                        room.participants.delete(socket.id);
                        this.io.to(`video_call_${bookingId}`).emit("participant_left", {
                            bookingId: bookingId,
                            userId: userId,
                            socketId: socket.id,
                            participants: Array.from(room.participants)
                        });
                        
                        if (room.participants.size === 0) {
                            this.videoCallRooms.delete(bookingId);
                        }
                    }
                });
                
                this.userSockets.delete(userId);
            });
        });

        return this.io;
    }

    static getIO() {
        if (!this.io) throw new Error("Socket.io not initialized");
        return this.io;
    }

    static sendToUser(userId: number, event: string, data: any) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
        }
    }

    static broadcastToBookingRoom(bookingId: number, event: string, data: any) {
        this.io.to(`video_call_${bookingId}`).emit(event, data);
    }
}