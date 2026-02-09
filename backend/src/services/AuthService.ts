
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserRepository } from "../repositories/UserRepository.js";
import { RefreshTokenRepository } from "../repositories/RefreshTokenRepository.js";
import { PasswordResetTokenRepository } from "../repositories/PasswordResetTokenRepository.js";
import { EmailVerificationTokenRepository } from "../repositories/EmailVerificationTokenRepository.js";
import {
  LoginCredentials,
  AuthTokens,
  JwtPayload,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from "../types/authTypes.js";
import { CreateUserDto, UserResponse } from "../types/userTypes.js";
import { EmailService } from "./EmailService.js";

export class AuthService {
  static async register(userData: CreateUserDto): Promise<UserResponse> {
    const { email, password, username } = userData;

    // Check if user exists
    const existingUserByEmail = await UserRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new Error("User with this email already exists");
    }

    const existingUserByUsername = await UserRepository.findByUsername(username);
    if (existingUserByUsername) {
      throw new Error("Username is already taken");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await UserRepository.create({
      ...userData,
      password: hashedPassword,
    });

    // Generate email verification token
    await this.generateEmailVerificationToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword as UserResponse;
  }

  static async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const { email, password } = credentials;

    // Find user
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("Account is deactivated. Please contact support.");
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new Error("Please verify your email before logging in");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return tokens;
  }

  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
    ) as JwtPayload;

    // Check if refresh token exists in database
    const tokenRecord = await RefreshTokenRepository.findByToken(refreshToken);
    if (!tokenRecord) {
      throw new Error("Invalid refresh token");
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      await RefreshTokenRepository.deleteByToken(refreshToken);
      throw new Error("Refresh token expired");
    }

    // Get user
    const user = await UserRepository.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user);

    // Delete old refresh token
    await RefreshTokenRepository.deleteByToken(refreshToken);

    return tokens;
  }

  static async logout(refreshToken: string): Promise<void> {
    await RefreshTokenRepository.deleteByToken(refreshToken);
  }

  static async logoutAll(userId: number): Promise<void> {
    await RefreshTokenRepository.deleteByUserId(userId);
  }

  static async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    const { email } = data;

    // Find user
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Save reset token
    await PasswordResetTokenRepository.create(user.id, resetToken, expiresAt);

    // Send reset email
    await EmailService.sendPasswordResetEmail(user.email, resetToken);
  }

  static async resetPassword(data: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = data;

    // Find reset token
    const resetToken = await PasswordResetTokenRepository.findByToken(token);
    if (!resetToken) {
      throw new Error("Invalid or expired reset token");
    }

    if (resetToken.used) {
      throw new Error("Reset token has already been used");
    }

    if (resetToken.expiresAt < new Date()) {
      throw new Error("Reset token has expired");
    }

    // Find user
    const user = await UserRepository.findById(resetToken.userId);
    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await UserRepository.updatePassword(user.id, hashedPassword);

    // Mark token as used
    await PasswordResetTokenRepository.markAsUsed(token);

    // Delete all refresh tokens (force logout from all devices)
    await RefreshTokenRepository.deleteByUserId(user.id);

    // Send password changed notification
    await EmailService.sendPasswordChangedNotification(user.email);
  }

  static async changePassword(
    userId: number,
    data: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword } = data;

    // Find user
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await UserRepository.updatePassword(user.id, hashedPassword);

    // Delete all refresh tokens (force logout from all devices)
    await RefreshTokenRepository.deleteByUserId(user.id);

    // Send password changed notification
    await EmailService.sendPasswordChangedNotification(user.email);
  }

  static async verifyEmail(token: string): Promise<void> {
    // Find verification token
    const verificationToken =
      await EmailVerificationTokenRepository.findByToken(token);
    if (!verificationToken) {
      throw new Error("Invalid or expired verification token");
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new Error("Verification token has expired");
    }

    // Find user
    const user = await UserRepository.findById(verificationToken.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update user email verification status
    await UserRepository.update(user.id, { emailVerified: true });

    // Delete verification token
    await EmailVerificationTokenRepository.deleteByUserId(user.id);

    // Send welcome email
    await EmailService.sendWelcomeEmail(user.email, user.username);
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    // Find user
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.emailVerified) {
      throw new Error("Email is already verified");
    }

    // Delete old verification tokens
    await EmailVerificationTokenRepository.deleteByUserId(user.id);

    // Generate new verification token
    await this.generateEmailVerificationToken(user.id);
  }

  private static async generateTokens(user: any): Promise<AuthTokens> {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate access token
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      {
        expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as any,
      }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as any,
      }
    );

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Store refresh token in database
    await RefreshTokenRepository.create(user.id, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }

  private static async generateEmailVerificationToken(
    userId: number,
  ): Promise<void> {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 1 day expiry

    // Save verification token
    await EmailVerificationTokenRepository.create(
      userId,
      verificationToken,
      expiresAt,
    );

    // Get user for email
    const user = await UserRepository.findById(userId);
    if (user) {
      // Send verification email
      await EmailService.sendVerificationEmail(user.email, verificationToken);
    }
  }

  static async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
