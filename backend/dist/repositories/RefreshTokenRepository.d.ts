import { RefreshToken } from "../types/authTypes.js";
export declare class RefreshTokenRepository {
    static create(userId: number, token: string, expiresAt: Date): Promise<RefreshToken>;
    static findByToken(token: string): Promise<RefreshToken | null>;
    static findByUserId(userId: number): Promise<RefreshToken[]>;
    static deleteByToken(token: string): Promise<boolean>;
    static deleteByUserId(userId: number): Promise<boolean>;
    static deleteExpiredTokens(): Promise<void>;
    private static toDomain;
}
//# sourceMappingURL=RefreshTokenRepository.d.ts.map