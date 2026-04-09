import { Request, Response } from "express";
import { LearningPathService } from "../services/LearningPathService.js";
import { LearningPathProgress } from "../models/LearningPathProgress.js";
import { StudentRepository } from "../repositories/StudentRepository.js";
import { LearningPathRepository } from "../repositories/LearningPathRepository.js";

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
            const { videoId, questionIndex, isNote, section, isCompleted, answer } = req.body;

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
                    videoId: videoId ?? null,
                    questionIndex: questionIndex ?? null,
                    isNote: isNote ?? false,
                    section: section ? (section.charAt(0).toUpperCase() + section.slice(1).toLowerCase()) : section
                },
                defaults: {
                    isCompleted: isCompleted ?? true,
                    answerText: answer ?? null
                }
            });

            if (!created) {
                await progress.update({ 
                    isCompleted: isCompleted ?? true,
                    answerText: answer ?? progress.answerText
                });
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

    /**
     * Bulk marks an entire section (Reading, Listening, Writing, or Speaking) as completed.
     */
    static async markSectionComplete(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const { section } = req.body; // e.g. "Reading"

            if (!userId || !section) {
                return res.status(400).json({ success: false, error: "Missing userId or section" });
            }

            const student = await StudentRepository.findByUserId(userId);
            if (!student) {
                return res.status(404).json({ success: false, error: "Student profile not found" });
            }

            const path = await LearningPathRepository.findByStudentId(student.id);
            if (!path) {
                return res.status(404).json({ success: false, error: "Learning path not found" });
            }

            // Normalizing the section string to match keys in the JSON sections
            const lowerSection = section.toLowerCase();
            const normalizedSection = section.charAt(0).toUpperCase() + section.slice(1).toLowerCase();

            // 1. Get all Video IDs for this section
            const videoIds = (path.videoSections as any)[lowerSection] || [];
            
            // 2. Get the number of questions in the Learning Mode for this section
            const questions = (path.learningModeSections as any)[lowerSection] || [];

            // 3. Perform bulk operations
            // We use upsert-like logic: findOrCreate or just bulk create/update.
            // For simplicity and to ensure data integrity, we'll iterate through and mark each.
            
            // Mark all videos
            for (const vId of videoIds) {
                await LearningPathProgress.findOrCreate({
                    where: { studentId: student.id, videoId: vId, section: normalizedSection },
                    defaults: { isCompleted: true }
                }).then(([progress, created]) => {
                   if (!created) progress.update({ isCompleted: true });
                });
            }

            // Mark all questions
            for (let i = 0; i < questions.length; i++) {
                await LearningPathProgress.findOrCreate({
                    where: { studentId: student.id, questionIndex: i, section: normalizedSection },
                    defaults: { isCompleted: true }
                }).then(([progress, created]) => {
                   if (!created) progress.update({ isCompleted: true });
                });
            }

            // Mark the note
            await LearningPathProgress.findOrCreate({
                where: { studentId: student.id, isNote: true, section: normalizedSection },
                defaults: { isCompleted: true }
            }).then(([progress, created]) => {
                if (!created) progress.update({ isCompleted: true });
            });

            // Return success
            return res.status(200).json({
                success: true,
                message: `${normalizedSection} section marked as complete.`
            });

        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Evaluates a speaking practice response using AI.
     */
    static async evaluateSpeaking(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const { questionIndex } = req.body;
            
            // express-fileupload attaches files to req.files
            const files = (req as any).files;
            const audioFile = files?.audio;

            if (!userId) {
                return res.status(401).json({ success: false, error: "Unauthorized" });
            }

            if (!audioFile) {
                return res.status(400).json({ success: false, error: "No audio file provided. Please upload as 'audio' field." });
            }

            const student = await StudentRepository.findByUserId(userId);
            if (!student) {
                return res.status(404).json({ success: false, error: "Student profile not found" });
            }

            // Normalizing file if it's an array
            const actualFile = Array.isArray(audioFile) ? audioFile[0] : audioFile;

            const result = await LearningPathService.evaluateSpeakingPractice(
                student.id,
                parseInt(questionIndex as string),
                actualFile.data.toString("base64"),
                actualFile.mimetype
            );

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}
