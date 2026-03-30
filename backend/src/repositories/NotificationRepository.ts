import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

export class NotificationRepository {
    static async create(data: {
        userId: number;
        title: string;
        message: string;
        type: string;
        relatedId?: number | undefined;
    }) {
        return await Notification.create(data);
    }

    static async findByUserId(userId: number, unreadOnly: boolean = false) {
        const where: any = { userId };
        if (unreadOnly) {
            where.isRead = false;
        }

        return await Notification.findAll({
            where,
            order: [['created_at', 'DESC']]
        });
    }

    static async findByIdAndUser(id: number, userId: number) {
        return await Notification.findOne({
            where: { id, userId }
        });
    }

    static async updateFcmToken(userId: number, fcmToken: string) {
        const user = await User.findByPk(userId);
        if (user) {
            user.fcmToken = fcmToken;
            await user.save();
            return true;
        }
        return false;
    }
    
    static async findUserWithToken(userId: number) {
        return await User.findByPk(userId, {
            attributes: ['id', 'fcmToken']
        });
    }
}
