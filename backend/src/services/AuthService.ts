import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { UserService } from "./UserService.js";
import { AuthRepository } from "../repositories/AuthRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { StudentRepository } from "../repositories/StudentRepository.js";
import { CounselorRepository } from "../repositories/CounselorRepository.js";
import { UserRole } from "../types/userTypes.js";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService.js";
import { User } from "../models/User.js";
import configs from "../config/configs.js";

interface GoogleTokenPayload {
  email: string;
  name?: string;
  sub: string;
}

const client = new OAuth2Client(configs.GOOGLE_CLIENT_ID);

export class AuthService {
  static async register(userData: any) {
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

  static async login(loginData: any) {
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

  static async googleLogin(idToken: string) {
    if (!idToken) {
      throw new Error("Google ID Token is required");
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: configs.GOOGLE_CLIENT_ID || "",
    });

    const payload = ticket.getPayload() as GoogleTokenPayload | undefined;
    if (!payload || !payload.email) throw new Error("Invalid Google Token");

    const { email, name, sub: googleId } = payload;
    let user = await UserRepository.findByEmail(email);

    if (!user) {
      user = await UserService.createUser({
        name: name || "Google User",
        email,
        googleId,
        role: UserRole.STUDENT,
      });
    } else if (!user.googleId) {
      // Link Google ID to existing account
      await UserRepository.update(user.id, { googleId });
    }

    // Refresh user instance to ensure we have latest data
    const refreshedUser = await UserRepository.findById(user.id);
    if (!refreshedUser) throw new Error("User not found after creation/update");
    if (!refreshedUser.isActive) throw new Error("Account is deactivated");

    return this.generateAuthResponse(refreshedUser);
  }

  static async logout(refreshToken: string) {
    await AuthRepository.deleteRefreshToken(refreshToken);
  }

  static async logoutAll(userId: number) {
    await AuthRepository.deleteAllRefreshTokensForUser(userId);
  }

  static async refreshToken(token: string) {
    const storedToken = await AuthRepository.findRefreshToken(token);
    if (!storedToken) throw new Error("Invalid refresh token");

    if (new Date() > storedToken.expiresAt) {
      await AuthRepository.deleteRefreshToken(token);
      throw new Error("Refresh token expired");
    }

    const payload = jwt.verify(token, configs.REFRESH_TOKEN_SECRET!) as any;
    const user = await UserRepository.findById(payload.id);
    if (!user) throw new Error("User not found");

    // Rotate tokens
    await AuthRepository.deleteRefreshToken(token);
    return this.generateAuthResponse(user);
  }

  static async forgotPassword(email: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error("User not found");

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Invalidate any existing unused reset tokens for this user
    await AuthRepository.invalidateOldPasswordResetTokens(user.id);

    await AuthRepository.createPasswordResetToken(user.id, token, expiresAt);

    // In a real app, this would be an email template
    const resetUrl = `${configs.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      text: `Click here to reset your password: ${resetUrl}`,
    });
  }

  static async resetPassword(token: string, newPassword: string) {
    const resetToken = await AuthRepository.findPasswordResetToken(token);

    if (!resetToken) {
      throw new Error("Invalid reset token");
    }

    const now = new Date();

    console.log("Password Reset Debug Log:", {
      token: token.substring(0, 8) + "...",
      userId: resetToken.userId,
      used: resetToken.used,
      currentTime: now.toISOString(),
      tokenExpiresAt: resetToken.expiresAt instanceof Date ? resetToken.expiresAt.toISOString() : resetToken.expiresAt,
      isExpired: now > resetToken.expiresAt,
      timeDifferenceMinutes: (resetToken.expiresAt.getTime() - now.getTime()) / (1000 * 60)
    });

    if (resetToken.used) {
      throw new Error("This reset token has already been used");
    }

    if (now > resetToken.expiresAt) {
      throw new Error("This reset token has expired");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(resetToken.userId, hashedPassword);
    await AuthRepository.markPasswordResetTokenAsUsed(token);
  }

  static async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await UserRepository.findById(userId);
    if (!user || !user.password) throw new Error("User not found");

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      throw new Error("Invalid old password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(userId, hashedPassword);
  }

  static async getMe(userId: number) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("User not found");
    return this.getUserWithProfile(user);
  }

  private static async getUserWithProfile(user: User) {
    let profileData: any = {};
    if (user.role === UserRole.STUDENT) {
      const student = await StudentRepository.findByUserId(user.id);
      if (student) profileData = student.toJSON();
    } else if (user.role === UserRole.COUNSELOR) {
      const counselor = await CounselorRepository.findByUserId(user.id);
      if (counselor) profileData = counselor.toJSON();
    }
    
    const { id, password, ...restProfile } = profileData; // prevent overwriting user id and avoid returning password
    return { ...user.toJSON(), ...restProfile, id: user.id, email: user.email, name: user.name, role: user.role };
  }

  private static async generateAuthResponse(user: User) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      configs.JWT_SECRET!,
      { expiresIn: (configs.JWT_ACCESS_EXPIRATION as any) || "2d" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      configs.REFRESH_TOKEN_SECRET!,
      { expiresIn: (configs.JWT_REFRESH_EXPIRATION as any) || "7d" }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await AuthRepository.createRefreshToken(user.id, refreshToken, expiresAt);

    const userWithProfile = await this.getUserWithProfile(user);
    return { user: userWithProfile, accessToken, refreshToken };
  }
}
