import { Request, Response } from "express";
import { NotificationService } from "../services/NotificationService.js";

export class NotificationController {
    static async getNotifications(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const unreadOnly = String(req.query.unreadOnly) === 'true';

            const notifications = await NotificationService.getUserNotifications(userId, unreadOnly);
            res.status(200).json(notifications);
        } catch (error) {
            console.error("[NotificationController] getNotifications error:", error);
            res.status(500).json({ error: "Failed to fetch notifications" });
        }
    }

    static async markAsRead(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const notificationId = parseInt(req.params.id as string);

            const success = await NotificationService.markAsRead(notificationId, userId);
            if (success) {
                res.status(200).json({ message: "Notification marked as read" });
            } else {
                res.status(404).json({ error: "Notification not found" });
            }
        } catch (error) {
            console.error("[NotificationController] markAsRead error:", error);
            res.status(500).json({ error: "Failed to update notification" });
        }
    }

    static async updateToken(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const { token } = req.body;

            if (!token) {
                res.status(400).json({ error: "Token is required" });
                return;
            }

            await NotificationService.updateFcmToken(userId, token);
            res.status(200).json({ message: "FCM token updated successfully" });
        } catch (error) {
            console.error("[NotificationController] updateToken error:", error);
            res.status(500).json({ error: "Failed to update FCM token" });
        }
    }
}
