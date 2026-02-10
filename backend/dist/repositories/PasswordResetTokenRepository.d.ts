import { PasswordResetToken } from "../types/authTypes.js";
export declare class PasswordResetTokenRepository {
    static create(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken>;
    static findByToken(token: string): Promise<PasswordResetToken | null>;
    static markAsUsed(token: string): Promise<boolean>;
    static deleteByUserId(userId: number): Promise<boolean>;
    static deleteExpiredTokens(): Promise<void>;
    private static toDomain;
}
//# sourceMappingURL=PasswordResetTokenRepository.d.ts.map