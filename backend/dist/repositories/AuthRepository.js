import { RefreshToken } from "../models/RefreshToken.js";
import { PasswordResetToken } from "../models/PasswordResetToken.js";
import { User } from "../models/User.js";
export class AuthRepository {
    // --- Refresh Tokens ---
    static async createRefreshToken(userId, token, expiresAt) {
        return RefreshToken.create({
            userId,
            token,
            expiresAt,
        });
    }
    static async findRefreshToken(token) {
        return RefreshToken.findOne({ where: { token } });
    }
    static async deleteRefreshToken(token) {
        return RefreshToken.destroy({ where: { token } });
    }
    static async deleteAllRefreshTokensForUser(userId) {
        return RefreshToken.destroy({ where: { userId } });
    }
    // --- Password Reset Tokens ---
    static async createPasswordResetToken(userId, token, expiresAt) {
        return PasswordResetToken.create({
            userId,
            token,
            expiresAt,
        });
    }
    static async findPasswordResetToken(token) {
        return PasswordResetToken.findOne({
            where: { token },
            include: [User]
        });
    }
    static async markPasswordResetTokenAsUsed(token) {
        // This updates all matching rows, returning the number of affected rows
        // It returns [affectedRows]
        return PasswordResetToken.update({ used: true }, { where: { token } });
    }
}
//# sourceMappingURL=AuthRepository.js.map