import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { UserService } from "./UserService.js";
import { AuthRepository } from "../repositories/AuthRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { UserRole } from "../types/userTypes.js";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService.js";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export class AuthService {
    static async register(userData) {
        const { name, email, password, role } = userData;
        const existingUser = await UserRepository.findByEmail(email);
        if (existingUser) {
            throw new Error("User already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserService.createUser({
            name,
            email,
            password: hashedPassword,
            role: role || UserRole.STUDENT,
        });
        return this.generateAuthResponse(newUser);
    }
    static async login(loginData) {
        const { email, password } = loginData;
        const user = await UserRepository.findByEmail(email);
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            throw new Error("Invalid credentials");
        }
        if (!user.isActive) {
            throw new Error("Account is deactivated");
        }
        return this.generateAuthResponse(user);
    }
    static async googleLogin(idToken) {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID || "",
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email)
            throw new Error("Invalid Google Token");
        const { email, name, sub: googleId } = payload;
        let user = await UserRepository.findByEmail(email);
        if (!user) {
            user = await UserService.createUser({
                name: name || "Google User",
                email,
                googleId,
                role: UserRole.STUDENT,
            });
        }
        else if (!user.googleId) {
            // Link Google ID to existing account
            await UserRepository.update(user.id, { googleId });
        }
        // Refresh user instance to ensure we have latest data
        const refreshedUser = await UserRepository.findById(user.id);
        if (!refreshedUser)
            throw new Error("User not found after creation/update");
        if (!refreshedUser.isActive)
            throw new Error("Account is deactivated");
        return this.generateAuthResponse(refreshedUser);
    }
    static async logout(refreshToken) {
        await AuthRepository.deleteRefreshToken(refreshToken);
    }
    static async logoutAll(userId) {
        await AuthRepository.deleteAllRefreshTokensForUser(userId);
    }
    static async refreshToken(token) {
        const storedToken = await AuthRepository.findRefreshToken(token);
        if (!storedToken)
            throw new Error("Invalid refresh token");
        if (new Date() > storedToken.expiresAt) {
            await AuthRepository.deleteRefreshToken(token);
            throw new Error("Refresh token expired");
        }
        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user = await UserRepository.findById(payload.id);
        if (!user)
            throw new Error("User not found");
        // Rotate tokens
        await AuthRepository.deleteRefreshToken(token);
        return this.generateAuthResponse(user);
    }
    static async forgotPassword(email) {
        const user = await UserRepository.findByEmail(email);
        if (!user)
            throw new Error("User not found");
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour
        await AuthRepository.createPasswordResetToken(user.id, token, expiresAt);
        // In a real app, this would be an email template
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await sendEmail({
            to: email,
            subject: "Password Reset Request",
            text: `Click here to reset your password: ${resetUrl}`,
        });
    }
    static async resetPassword(token, newPassword) {
        const resetToken = await AuthRepository.findPasswordResetToken(token);
        if (!resetToken)
            throw new Error("Invalid or expired reset token");
        if (resetToken.used || new Date() > resetToken.expiresAt) {
            throw new Error("Invalid or expired reset token");
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await UserRepository.updatePassword(resetToken.userId, hashedPassword);
        await AuthRepository.markPasswordResetTokenAsUsed(token);
    }
    static async changePassword(userId, oldPassword, newPassword) {
        const user = await UserRepository.findById(userId);
        if (!user || !user.password)
            throw new Error("User not found");
        if (!(await bcrypt.compare(oldPassword, user.password))) {
            throw new Error("Invalid old password");
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await UserRepository.updatePassword(userId, hashedPassword);
    }
    static async getMe(userId) {
        const user = await UserRepository.findById(userId);
        if (!user)
            throw new Error("User not found");
        return user;
    }
    static async generateAuthResponse(user) {
        const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await AuthRepository.createRefreshToken(user.id, refreshToken, expiresAt);
        return { user, accessToken, refreshToken };
    }
}
//# sourceMappingURL=AuthService.js.map