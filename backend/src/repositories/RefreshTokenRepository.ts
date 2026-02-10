import { RefreshToken } from "../models/RefreshToken.js";

export class RefreshTokenRepository {
    static async create(
        userId: number,
        token: string,
        expiresAt: Date,
    ): Promise<RefreshToken> {
        return RefreshToken.create({
            userId,
            token,
            expiresAt,
        });
    }

    static async findByToken(token: string): Promise<RefreshToken | null> {
        return RefreshToken.findOne({ where: { token } });
    }

    static async findByUserId(userId: number): Promise<RefreshToken[]> {
        return RefreshToken.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
    }

    static async deleteByToken(token: string): Promise<boolean> {
        const deletedRows = await RefreshToken.destroy({ where: { token } });
        return deletedRows > 0;
    }

    static async deleteByUserId(userId: number): Promise<boolean> {
        const deletedRows = await RefreshToken.destroy({ where: { userId } });
        return deletedRows > 0;
    }

    static async deleteExpiredTokens(): Promise<void> {
        const { Op } = await import("sequelize");
        await RefreshToken.destroy({
            where: {
                expiresAt: {
                    [Op.lt]: new Date()
                }
            }
        });
    }
}
