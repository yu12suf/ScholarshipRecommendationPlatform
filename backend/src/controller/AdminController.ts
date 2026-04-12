import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/AdminService.js";

export class AdminController {
  static async getPlatformStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = '30d' } = req.query;
      const stats = await AdminService.getPlatformStats(period as string);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async getSystemLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { level, category, startDate, endDate, page = 1, limit = 50 } = req.query;
      const logs = await AdminService.getSystemLogs({
        level: level as string,
        category: category as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }

  static async getSecurityCenter(req: Request, res: Response, next: NextFunction) {
    try {
      const security = await AdminService.getSecurityInfo();
      res.json(security);
    } catch (error) {
      next(error);
    }
  }

  static async getBlockedIPs(req: Request, res: Response, next: NextFunction) {
    try {
      const ips = await AdminService.getBlockedIPs();
      res.json(ips);
    } catch (error) {
      next(error);
    }
  }

  static async blockIP(req: Request, res: Response, next: NextFunction) {
    try {
      const { ip, reason } = req.body;
      const result = await AdminService.blockIP(ip, reason);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async unblockIP(req: Request, res: Response, next: NextFunction) {
    try {
      const { ip } = req.params;
      const result = await AdminService.unblockIP(ip);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await AdminService.getSettings();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = req.body;
      const result = await AdminService.updateSettings(settings);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getSecurityEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 20 } = req.query;
      const events = await AdminService.getSecurityEvents(parseInt(limit as string));
      res.json(events);
    } catch (error) {
      next(error);
    }
  }

  static async getEngagementMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = '30d' } = req.query;
      const metrics = await AdminService.getEngagementMetrics(period as string);
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  }
}
