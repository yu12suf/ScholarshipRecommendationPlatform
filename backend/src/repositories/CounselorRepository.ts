import { Counselor } from "../models/Counselor.js";
import { User } from "../models/User.js";
import { Op, Order } from "sequelize";
import { CounselorReview } from "../models/CounselorReview.js";

export class CounselorRepository {
    static async findByUserId(userId: number): Promise<Counselor | null> {
        if (!userId || userId <= 0) return null;
        return Counselor.findOne({ where: { userId } });
    }

    static async create(data: any): Promise<Counselor> {
        return Counselor.create(data);
    }

    static async update(userId: number, updates: any): Promise<Counselor | null> {
        const counselor = await this.findByUserId(userId);
        if (!counselor) return null;
        return counselor.update(updates);
    }

    static async findById(id: number): Promise<Counselor | null> {
        if (!id || id <= 0) return null;
        return Counselor.findByPk(id);
    }

    static async findByUserIdWithUser(userId: number): Promise<Counselor | null> {
        return Counselor.findOne({
            where: { userId },
            include: [{ model: User, as: "user" }]
        });
    }

    static async findVerifiedDirectory(filters: {
        specialization?: string;
        language?: string;
        mode?: string;
        minRating?: number;
        page: number;
        limit: number;
    }): Promise<{ rows: Counselor[]; count: number }> {
        const whereClause: any = {
            verificationStatus: "verified",
            isActive: true,
        };

        if (filters.minRating !== undefined) {
            whereClause.rating = { [Op.gte]: filters.minRating };
        }

        if (filters.specialization) {
            whereClause.areasOfExpertise = { [Op.iLike]: `%${filters.specialization}%` };
        }

        const offset = (filters.page - 1) * filters.limit;
        return Counselor.findAndCountAll({
            where: whereClause,
            include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
            order: [["rating", "DESC"], ["updatedAt", "DESC"]] as Order,
            offset,
            limit: filters.limit,
        });
    }

    static async findByUserIds(userIds: number[]): Promise<Counselor[]> {
        if (userIds.length === 0) return [];
        return Counselor.findAll({ where: { userId: { [Op.in]: userIds } } });
    }

    static async recalculateRating(counselorId: number): Promise<void> {
        const reviews = await CounselorReview.findAll({
            where: { counselorId },
            attributes: ["rating"],
        });
        const avg = reviews.length === 0
            ? 0
            : reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;
        await Counselor.update({ rating: Number(avg.toFixed(2)) }, { where: { id: counselorId } });
    }
}