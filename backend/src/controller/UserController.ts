import { Request, Response } from "express";
import { UserService } from "../services/UserService.js";
import { UserRole } from "../types/userTypes.js";

export class UserController {
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const profile = await UserService.getProfile(userId);

      res.json({
        success: true,
        data: { user: profile },
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const updatedProfile = await UserService.updateProfile(userId, req.body);

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user: updatedProfile },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const { limit = 10, page = 1 } = req.query;
      const users = await UserService.getAllUsers(Number(limit), Number(page));

      res.json({
        success: true,
        data: { users },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getUsersByRole(req: Request, res: Response) {
    try {
      const { role } = req.params;
      const { limit = 10, page = 1 } = req.query;

      if (!Object.values(UserRole).includes(role as UserRole)) {
        return res.status(400).json({
          success: false,
          error: "Invalid role",
        });
      }

      const users = await UserService.getUsersByRole(
        role as UserRole,
        Number(limit),
        Number(page),
      );

      res.json({
        success: true,
        data: { users },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(Number(id));

      res.json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const currentUserRole = req.user!.role;
      const currentUserId = req.user!.userId;

      const updatedUser = await UserService.updateUserRole(
        Number(id),
        role,
        currentUserRole,
        currentUserId,
      );

      res.json({
        success: true,
        message: "User role updated successfully",
        data: { user: updatedUser },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async deactivateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUserRole = req.user!.role;
      const currentUserId = req.user!.userId;

      await UserService.deactivateUser(Number(id), currentUserRole, currentUserId);

      res.json({
        success: true,
        message: "User deactivated successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async activateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUserRole = req.user!.role;

      await UserService.activateUser(Number(id), currentUserRole);

      res.json({
        success: true,
        message: "User activated successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
