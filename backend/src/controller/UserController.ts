import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService.js";
import { UpdateUserDto, UserRole } from "../types/userTypes.js";

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const user = await UserService.getProfile(req.user.id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const updates: UpdateUserDto = req.body;
      const user = await UserService.updateProfile(req.user.id, updates);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const users = await UserService.getAllUsers(limit, offset);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  static async getUsersByRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.params;
      const users = await UserService.getUsersByRole(role as UserRole);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const user = await UserService.getUserById(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const { role } = req.body;
      const user = await UserService.updateUserRole(id, role);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const user = await UserService.deactivateUser(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({ message: "User deactivated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const user = await UserService.activateUser(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json({ message: "User activated successfully" });
    } catch (error) {
      next(error);
    }
  }
}
