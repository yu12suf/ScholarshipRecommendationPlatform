import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService.js";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);

      // Cookie options
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : ("lax" as const),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res.cookie("refreshToken", result.refreshToken, cookieOptions as any);
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

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : ("lax" as const),
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };

      res.cookie("refreshToken", result.refreshToken, cookieOptions as any);
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
      const { credential } = req.body;
      const result = await AuthService.googleLogin(credential);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : ("lax" as const),
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };

      res.cookie("refreshToken", result.refreshToken, cookieOptions as any);
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

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : ("lax" as const),
        maxAge: 7 * 24 * 60 * 60 * 1000,
      };

      res.cookie("refreshToken", result.refreshToken, cookieOptions as any);
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
      const { oldPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user.id, oldPassword, newPassword);
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
}
