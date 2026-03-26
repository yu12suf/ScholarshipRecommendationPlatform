import { Request, Response } from "express";
import { LearningPathService } from "../services/LearningPathService.js";
import { LearningPathProgress } from "../models/LearningPathProgress.js";
import { StudentRepository } from "../repositories/StudentRepository.js";

export class LearningPathController {
    /**
     * Gets the student's personalized learning path formatted by skill.
     */
    static async getMyPath(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ status: "error", message: "Unauthorized" });
            }

            const student = await StudentRepository.findByUserId(userId);
            if (!student) {
                return res.status(404).json({ status: "error", message: "Student profile not found" });
            }

            const path = await LearningPathService.getFormattedPath(student.id);

            return res.status(200).json({
                status: "success",
                data: path
            });
        } catch (error: any) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }

    /**
     * Marks a specific video or section as completed.
     */
    static async markComplete(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const { videoId, section, isCompleted } = req.body;

            if (!userId) {
                return res.status(401).json({ success: false, error: "Unauthorized" });
            }

            const student = await StudentRepository.findByUserId(userId);
            if (!student) {
                return res.status(404).json({ success: false, error: "Student profile not found" });
            }

            const [progress, created] = await LearningPathProgress.findOrCreate({
                where: {
                    studentId: student.id,
                    videoId: videoId || null,
                    section
                },
                defaults: {
                    isCompleted: isCompleted ?? true
                }
            });

            if (!created) {
                await progress.update({ isCompleted: isCompleted ?? true });
            }

            return res.status(200).json({
                success: true,
                data: progress
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}
