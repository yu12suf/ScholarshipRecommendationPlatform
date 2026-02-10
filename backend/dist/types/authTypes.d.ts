import { UserRole } from "./userTypes.js";
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface JwtPayload {
    userId: number;
    email: string;
    role: UserRole;
}
export interface ForgotPasswordDto {
    email: string;
}
export interface ResetPasswordDto {
    token: string;
    newPassword: string;
    confirmPassword: string;
}
export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export interface RefreshToken {
    id: number;
    userId: number;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}
export interface PasswordResetToken {
    id: number;
    userId: number;
    token: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
}
//# sourceMappingURL=authTypes.d.ts.map