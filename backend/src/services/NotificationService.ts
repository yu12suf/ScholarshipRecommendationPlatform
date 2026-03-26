import { NotificationRepository } from "../repositories/NotificationRepository.js";
import { FirebaseService } from "./FirebaseService.js";

export class NotificationService {
    static async createNotification(userId: number, title: string, message: string, type: string, relatedId?: number | undefined) {
        try {
            const notification = await NotificationRepository.create({
            userId,
                title,
                message,
                type,
                relatedId
            });

            // Find user effectively via repository to get FCM token
            const user = await NotificationRepository.findUserWithToken(userId);
            if (user?.fcmToken) {
                console.log(`[NotificationService] Sending push to user ${userId}...`);
                await FirebaseService.sendPush(user.fcmToken, title, message, { type, scholarshipId: relatedId });
            }

            return notification;
        } catch (error) {
            console.error("[NotificationService] createNotification error:", error);
            throw error;
        }
    }

    static async getUserNotifications(userId: number, unreadOnly: boolean = false) {
        return await NotificationRepository.findByUserId(userId, unreadOnly);
    }

    static async markAsRead(notificationId: number, userId: number) {
        const notification = await NotificationRepository.findByIdAndUser(notificationId, userId);

        if (notification) {
            notification.isRead = true;
            await notification.save();
            return true;
        }
        return false;
    }

    static async updateFcmToken(userId: number, fcmToken: string) {
        return await NotificationRepository.updateFcmToken(userId, fcmToken);
    }
}
