import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService.js";
import configs from "../config/configs.js";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.cookie("refreshToken", result.refreshToken, AuthController.getCookieOptions());
      res.status(201).json({
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.cookie("refreshToken", result.refreshToken, AuthController.getCookieOptions());
      res.json({
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { credential, idToken, id_token, role } = req.body;
      const token = credential || idToken || id_token;

      if (!token) {
        res.status(400).json({ error: "Google ID Token is required (credential, idToken, or id_token)" });
        return;
      }

      const result = await AuthService.googleLogin(token, role);
      res.cookie("refreshToken", result.refreshToken, AuthController.getCookieOptions());
      res.json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        res.status(401).json({ error: "Refresh token not found" });
        return;
      }

      const result = await AuthService.refreshToken(refreshToken);
      res.cookie("refreshToken", result.refreshToken, AuthController.getCookieOptions());
      res.json({
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.clearCookie("refreshToken");
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      await AuthService.logoutAll(req.user.id);
      res.clearCookie("refreshToken");
      res.json({ message: "Logged out from all devices" });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.forgotPassword(req.body.email);
      res.json({ message: "Password reset email sent" });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      await AuthService.resetPassword(token, newPassword);
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { currentPassword, oldPassword, newPassword, confirmPassword } = req.body;

      // Use currentPassword if provided, otherwise fallback to oldPassword
      const passwordToCompare = currentPassword || oldPassword;

      if (!passwordToCompare || !newPassword) {
        res.status(400).json({ error: "Current password and new password are required" });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({ error: "New password and confirmation do not match" });
        return;
      }

      await AuthService.changePassword(req.user.id, passwordToCompare, newPassword);
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const user = await AuthService.getMe(req.user.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  private static getCookieOptions() {
    return {
      httpOnly: true,
      secure: configs.NODE_ENV === "production",
      sameSite: (configs.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  }
}
