import { RefreshToken } from "../models/RefreshToken.js";
import { PasswordResetToken } from "../models/PasswordResetToken.js";
import { User } from "../models/User.js";

export class AuthRepository {
    // --- Refresh Tokens ---

    static async createRefreshToken(userId: number, token: string, expiresAt: Date): Promise<RefreshToken> {
        return RefreshToken.create({
            userId,
            token,
            expiresAt,
        });
    }

    static async findRefreshToken(token: string): Promise<RefreshToken | null> {
        return RefreshToken.findOne({ where: { token } });
    }

    static async deleteRefreshToken(token: string): Promise<number> {
        return RefreshToken.destroy({ where: { token } });
    }

    static async deleteAllRefreshTokensForUser(userId: number): Promise<number> {
        return RefreshToken.destroy({ where: { userId } });
    }

    // --- Password Reset Tokens ---

    static async createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken> {
        return PasswordResetToken.create({
            userId,
            token,
            expiresAt,
        });
    }

    static async findPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
        return PasswordResetToken.findOne({
            where: { token },
            include: [User]
        });
    }

    static async markPasswordResetTokenAsUsed(token: string): Promise<[number]> {
        // This updates all matching rows, returning the number of affected rows
        // It returns [affectedRows]
        return PasswordResetToken.update({ used: true }, { where: { token } });
    }
}
