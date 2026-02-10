import { User } from "../models/User.js";
export declare class AuthService {
    static register(userData: any): Promise<{
        user: User;
        accessToken: string;
        refreshToken: string;
    }>;
    static login(loginData: any): Promise<{
        user: User;
        accessToken: string;
        refreshToken: string;
    }>;
    static googleLogin(idToken: string): Promise<{
        user: User;
        accessToken: string;
        refreshToken: string;
    }>;
    static logout(refreshToken: string): Promise<void>;
    static logoutAll(userId: number): Promise<void>;
    static refreshToken(token: string): Promise<{
        user: User;
        accessToken: string;
        refreshToken: string;
    }>;
    static forgotPassword(email: string): Promise<void>;
    static resetPassword(token: string, newPassword: string): Promise<void>;
    static changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void>;
    static getMe(userId: number): Promise<User>;
    private static generateAuthResponse;
}
//# sourceMappingURL=AuthService.d.ts.map