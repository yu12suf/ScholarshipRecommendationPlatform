import { Request, Response } from "express";
import { AuthService } from "../services/AuthService.js";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const user = await AuthService.register(req.body);

      res.status(201).json({
        success: true,
        message:
          "User registered successfully. Please check your email to verify your account.",
        data: { user },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const tokens = await AuthService.login(req.body);

      res.json({
        success: true,
        message: "Login successful",
        data: tokens,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: tokens,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async logoutAll(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      await AuthService.logoutAll(userId);

      res.json({
        success: true,
        message: "Logged out from all devices",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      await AuthService.forgotPassword(req.body);

      res.json({
        success: true,
        message:
          "If an account exists with this email, you will receive password reset instructions.",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      await AuthService.resetPassword(req.body);

      res.json({
        success: true,
        message:
          "Password has been reset successfully. Please login with your new password.",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      await AuthService.changePassword(userId, req.body);

      res.json({
        success: true,
        message:
          "Password changed successfully. Please login with your new password.",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;
      await AuthService.verifyEmail(token);

      res.json({
        success: true,
        message: "Email verified successfully. You can now login.",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async resendVerificationEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await AuthService.resendVerificationEmail(email);

      res.json({
        success: true,
        message: "Verification email has been resent. Please check your inbox.",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const user = req.user;

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
