import { Request, Response } from "express";
import { LearningPathService } from "../services/LearningPathService.js";
import { LearningPathProgress } from "../models/LearningPathProgress.js";

export class LearningPathController {
    /**
     * Gets the student's personalized learning path formatted by skill.
     */
    static async getMyPath(req: Request, res: Response) {
        try {
            const studentId = req.user?.id; // Assuming student ID is mapped in JWT or needs lookup
            // Note: In this system, userId and studentId might differ. 
            // We need to ensure we have the student record ID.

            if (!studentId) {
                return res.status(401).json({ success: false, error: "Unauthorized" });
            }

            const path = await LearningPathService.getFormattedPath(studentId);

            if (!path) {
                return res.status(404).json({
                    success: false,
                    message: "Learning path not generated yet. Complete an assessment first."
                });
            }

            return res.status(200).json({
                success: true,
                data: path
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Marks a specific video or section as completed.
     */
    static async markComplete(req: Request, res: Response) {
        try {
            const studentId = req.user?.id;
            const { videoId, section, isCompleted } = req.body;

            if (!studentId) {
                return res.status(401).json({ success: false, error: "Unauthorized" });
            }

            const [progress, created] = await LearningPathProgress.findOrCreate({
                where: {
                    studentId,
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
