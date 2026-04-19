import { ChatMessage } from "../models/ChatMessage.js";
import { Conversation } from "../models/Conversation.js";
import { ConversationParticipant } from "../models/ConversationParticipant.js";
import { User } from "../models/User.js";
import { Op } from "sequelize";
import { Consultation } from "../models/Consultation.js";
import { sequelize } from "../config/sequelize.js";

export class ChatService {
    /**
     * Get or create a conversation between two users (Student and Counselor)
     * Validates that they have an active booking/consultation.
     */
    static async getOrCreateConversation(userId1: number, userId2: number) {
        // Find existing conversation with these two exact participants
        const participantInfo: any = await ConversationParticipant.findAll({
            where: {
                userId: { [Op.in]: [userId1, userId2] }
            },
            attributes: ['conversationId'],
            group: ['conversationId'],
            having: sequelize.literal(`COUNT(DISTINCT "user_id") = 2`)
        });

        if (participantInfo.length > 0) {
            const conversationId = participantInfo[0].conversationId;
            const existing = await Conversation.findByPk(conversationId);
            if (existing) return existing;
        }

        // No conversation exists. Validate if they are allowed to chat.
        // Rule: Only allowed if there's a booking between them.
        const studentsId = Math.min(userId1, userId2); // Assumption: student is one, counselor is other
        // Better: Find roles to be sure
        const user1 = await User.findByPk(userId1);
        const user2 = await User.findByPk(userId2);

        if (!user1 || !user2) throw new Error("Users not found");

        const studentId = user1.role === 'student' ? user1.id : (user2.role === 'student' ? user2.id : null);
        const counselorId = user1.role === 'counselor' ? user1.id : (user2.role === 'counselor' ? user2.id : null);

        // Create new
        const conversation = await Conversation.create();
        await ConversationParticipant.create({ conversationId: conversation.id, userId: userId1 });
        await ConversationParticipant.create({ conversationId: conversation.id, userId: userId2 });

        return conversation;
    }

    static async sendMessage(conversationId: number, senderId: number, content: string) {
        const message = await ChatMessage.create({
            conversationId,
            senderId,
            content
        });
        
        // Include sender info for real-time delivery
        return ChatMessage.findByPk(message.id, {
            include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'role'] }]
        });
    }

    static async getConversations(userId: number) {
        // First, get all conversation IDs that the user participates in
        const userParticipations = await ConversationParticipant.findAll({
            where: { userId },
            attributes: ['conversationId']
        });
        
        const conversationIds = userParticipations.map(p => p.conversationId);
        
        if (conversationIds.length === 0) {
            return [];
        }
        
        // Get all conversations with their participants
        const conversations = await Conversation.findAll({
            where: { id: { [Op.in]: conversationIds } },
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM "chat_messages" AS "msg"
                            WHERE "msg"."conversation_id" = "Conversation"."id"
                            AND "msg"."sender_id" != ${userId}
                            AND "msg"."is_read" = false
                        )`),
                        'unreadCount'
                    ]
                ]
            },
            include: [
                {
                    model: ConversationParticipant,
                    as: 'conversationParticipants',
                    attributes: ['userId']
                },
                {
                    model: ChatMessage,
                    as: 'messages',
                    limit: 1,
                    order: [['created_at', 'DESC']],
                    attributes: ['content', 'createdAt']
                }
            ],
            order: [['updatedAt', 'DESC']]
        });

        // Get all user IDs from conversation participants
        const allParticipantIds = await ConversationParticipant.findAll({
            where: { conversationId: { [Op.in]: conversationIds } },
            attributes: ['userId']
        });
        
        const uniqueUserIds = [...new Set(allParticipantIds.map(p => p.userId))];
        
        // Get user details for all participants
        const users = await User.findAll({
            where: { id: { [Op.in]: uniqueUserIds } },
            attributes: ['id', 'name', 'role', 'email']
        });
        
        const userMap = new Map(users.map(u => [u.id, u]));

        // Attach users to conversations, filtering out current user
        return conversations.map((conv: any) => {
            const allParticipants = conv.conversationParticipants || [];
            const otherParticipantUserIds = allParticipants
                .filter((p: any) => p.userId !== userId)
                .map((p: any) => p.userId);
            
            const otherUsers = otherParticipantUserIds
                .map(id => userMap.get(id))
                .filter(Boolean);
            
            return {
                ...conv.toJSON(),
                users: otherUsers
            };
        });
    }

    static async getAvailableUsersToChat(userId: number) {
        return User.findAll({
            where: {
                id: { [Op.ne]: userId }
            },
            attributes: ['id', 'name', 'role', 'email']
        });
    }

    static async getMessages(conversationId: number, limit = 50, offset = 0) {
        return ChatMessage.findAll({
            where: { conversationId },
            include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'role'] }],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
    }

    static async markAsRead(conversationId: number, userId: number) {
        return ChatMessage.update(
            { isRead: true },
            {
                where: {
                    conversationId,
                    senderId: { [Op.ne]: userId },
                    isRead: false
                }
            }
        );
    }
}
