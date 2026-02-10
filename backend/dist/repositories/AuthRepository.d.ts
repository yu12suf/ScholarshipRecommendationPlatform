import { RefreshToken } from "../models/RefreshToken.js";
import { PasswordResetToken } from "../models/PasswordResetToken.js";
export declare class AuthRepository {
    static createRefreshToken(userId: number, token: string, expiresAt: Date): Promise<RefreshToken>;
    static findRefreshToken(token: string): Promise<RefreshToken | null>;
    static deleteRefreshToken(token: string): Promise<number>;
    static deleteAllRefreshTokensForUser(userId: number): Promise<number>;
    static createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken>;
    static findPasswordResetToken(token: string): Promise<PasswordResetToken | null>;
    static markPasswordResetTokenAsUsed(token: string): Promise<[number]>;
}
//# sourceMappingURL=AuthRepository.d.ts.map