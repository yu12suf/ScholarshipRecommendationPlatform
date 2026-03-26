import { Request, Response, NextFunction } from "express";
import { AssessmentService } from "../services/AssessmentService.js";
import { StudentRepository } from "../repositories/StudentRepository.js";

export class AssessmentController {
    static async generate(req: Request, res: Response, next: NextFunction) {
        try {
            const { examType, difficulty } = req.body;
            if (!examType || !difficulty) {
                res.status(400).json({ error: "examType and difficulty are required" });
                return;
            }
            const result = await AssessmentService.generateExam(examType, difficulty);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    static async submit(req: Request, res: Response, next: NextFunction) {
        try {
            const { test_id, responses } = req.body;
            if (!test_id || !responses) {
                res.status(400).json({ error: "test_id and responses are required" });
                return;
            }

            // If sending via FormData (with a file), 'responses' will usually come in as a stringifed JSON payload
            let parsedResponses = responses;
            if (typeof responses === "string") {
                try {
                    parsedResponses = JSON.parse(responses);
                } catch (e) {
                    res.status(400).json({ error: "responses must be a valid JSON object or stringified JSON" });
                    return;
                }
            }

            let audioData: { buffer: Buffer; mimetype: string } | undefined;
            // express-fileupload attaches files to req.files
            if (req.files && req.files.audio) {
                const audioFile = Array.isArray(req.files.audio) ? req.files.audio[0] : req.files.audio;
                if (audioFile) {
                    audioData = {
                        buffer: audioFile.data,
                        mimetype: audioFile.mimetype
                    };
                }
            }

            const student = await StudentRepository.findByUserId(req.user!.id);
            if (!student) {
                res.status(404).json({ error: "Student profile not found" });
                return;
            }

            const result = await AssessmentService.submitAssessment(test_id, parsedResponses, student.id, audioData);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getResult(req: Request, res: Response, next: NextFunction) {
        try {
            const { test_id } = req.params;
            if (!test_id || typeof test_id !== "string") {
                res.status(400).json({ error: "test_id is required and must be a string" });
                return;
            }

            const result = await AssessmentService.getAssessmentResult(test_id);
            console.log(result);

            if (!result) {
                res.status(404).json({ error: "Result not found or still processing" });
                return;
            }

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    static async getProgress(req: Request, res: Response, next: NextFunction) {
        try {
            const examType = req.query.examType as string | undefined;
            const student = await StudentRepository.findByUserId(req.user!.id);
            if (!student) {
                res.status(404).json({ error: "Student profile not found" });
                return;
            }
            console.log(student.id);
            console.log(examType);
            const progress = await AssessmentService.getStudentProgress(student.id as number, examType as string);
            res.json({
                status: "success",
                data: progress
            });
        } catch (error) {
            next(error);
        }
    }
}
