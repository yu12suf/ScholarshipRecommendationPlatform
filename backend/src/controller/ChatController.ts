import { Request, Response } from "express";
import { ChatService } from "../services/ChatService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../errors/AppError.js";

export class ChatController {
    /**
     * POST /messages - Send a message to a user (starts conversation if doesn't exist)
     */
    static sendMessage = catchAsync(async (req: Request, res: Response) => {
        const { receiverId, content } = req.body;
        const senderId = (req as any).user.id;

        if (!receiverId || !content) {
            throw new AppError("Invalid request. Missing receiverId or content.", 400);
        }

        const conversation = await ChatService.getOrCreateConversation(senderId, Number(receiverId));
        const message = await ChatService.sendMessage(conversation.id, senderId, content);

        res.status(201).json({
            status: "success",
            data: { conversation, message }
        });
    });

    /**
     * GET /conversations - Fetch all user's conversations
     */
    static getConversations = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const conversations = await ChatService.getConversations(userId);

        res.status(200).json({
            status: "success",
            data: conversations
        });
    });

    /**
     * GET /messages/:conversationId - Fetch messages for a specific conversation
     */
    static getMessages = catchAsync(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        const { limit, offset } = req.query;

        const messages = await ChatService.getMessages(
            Number(conversationId),
            limit ? Number(limit) : 50,
            offset ? Number(offset) : 0
        );

        res.status(200).json({
            status: "success",
            data: messages
        });
    });

    /**
     * PATCH /messages/read/:conversationId - Mark messages in a conversation as read
     */
    static markAsRead = catchAsync(async (req: Request, res: Response) => {
        const { conversationId } = req.params;
        const userId = (req as any).user.id;

        await ChatService.markAsRead(Number(conversationId), userId);

        res.status(200).json({
            status: "success",
            message: "Messages marked as read."
        });
    });

    /**
     * POST /upload - Upload a file to chat
     */
    static uploadFile = catchAsync(async (req: Request, res: Response) => {
        if (!req.files || !req.files.file) {
            throw new AppError("No file uploaded", 400);
        }

        const file = req.files.file as any;
        
        // Import FileService dynamically or at the top? Wait, ChatController needs FileService!
        const { FileService } = await import("../services/FileService.js");
        
        const secureUrl = await FileService.uploadFile(file.data, "chat_attachments");

        res.status(200).json({
            status: "success",
            data: { url: secureUrl }
        });
    });
}
