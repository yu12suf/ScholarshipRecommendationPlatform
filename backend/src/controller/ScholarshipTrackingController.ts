import { Request, Response, NextFunction } from "express";
import { ScholarshipTrackingService } from "../services/ScholarshipTrackingService.js";
import { StudentRepository } from "../repositories/StudentRepository.js";

export class ScholarshipTrackingController {
    static async track(req: Request, res: Response, next: NextFunction) {
        try {
            const scholarshipId = req.params.scholarshipId as string;
            const student = await StudentRepository.findByUserId(req.user!.id);
            if (!student) {
                res.status(404).json({ error: "Student profile not found" });
                return;
            }

            const tracked = await ScholarshipTrackingService.trackScholarship(student.id, parseInt(scholarshipId));
            res.status(201).json({
                status: "success",
                data: tracked
            });
        } catch (error: any) {
            if (error.message === "Scholarship already in watchlist") {
                res.status(400).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }

    static async getWatchlist(req: Request, res: Response, next: NextFunction) {
        try {
            const student = await StudentRepository.findByUserId(req.user!.id);
            if (!student) {
                res.status(404).json({ error: "Student profile not found" });
                return;
            }

            const watchlist = await ScholarshipTrackingService.getWatchlist(student.id);
            res.json({
                status: "success",
                data: watchlist
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateDeadline(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { deadline } = req.body;
            const student = await StudentRepository.findByUserId(req.user!.id);
            if (!student) {
                res.status(404).json({ error: "Student profile not found" });
                return;
            }

            const updated = await ScholarshipTrackingService.updateDeadline(parseInt(id), student.id, new Date(deadline));
            res.json({
                status: "success",
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { status } = req.body;
            const student = await StudentRepository.findByUserId(req.user!.id);
            if (!student) {
                res.status(404).json({ error: "Student profile not found" });
                return;
            }

            const updated = await ScholarshipTrackingService.updateStatus(parseInt(id), student.id, status);
            res.json({
                status: "success",
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateNotificationSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { leadTime } = req.body;
            const student = await StudentRepository.findByUserId(req.user!.id);
            if (!student) {
                res.status(404).json({ error: "Student profile not found" });
                return;
            }

            const updated = await ScholarshipTrackingService.updateNotificationSettings(parseInt(id), student.id, parseInt(leadTime));
            res.json({
                status: "success",
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    static async addMilestone(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { name, type, description, deadline } = req.body;
            const student = await StudentRepository.findByUserId(req.user!.id);
            if (!student) {
                res.status(404).json({ error: "Student profile not found" });
                return;
            }

            const milestone = await ScholarshipTrackingService.addMilestone(parseInt(id), student.id, { 
                name, 
                type: type || 'OTHER',
                description,
                deadline: new Date(deadline) 
            });
            res.status(201).json({
                status: "success",
                data: milestone
            });
        } catch (error) {
            next(error);
        }
    }

    static async toggleMilestone(req: Request, res: Response, next: NextFunction) {
        try {
            const milestoneId = req.params.milestoneId as string;
            const { isCompleted } = req.body;
            const student = await StudentRepository.findByUserId(req.user!.id);
            if (!student) {
                res.status(404).json({ error: "Student profile not found" });
                return;
            }

            const updated = await ScholarshipTrackingService.toggleMilestone(parseInt(milestoneId), student.id, isCompleted);
            res.json({
                status: "success",
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    static async getCalendar(req: Request, res: Response, next: NextFunction) {
        try {
            const student = await StudentRepository.findByUserId(req.user!.id);
            if (!student) {
                res.status(404).json({ error: "Student profile not found" });
                return;
            }

            const events = await ScholarshipTrackingService.getCalendarDeadlines(student.id);
            res.json({
                status: "success",
                data: events
            });
        } catch (error) {
            next(error);
        }
    }
}
