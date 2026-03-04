import { Request, Response, NextFunction } from "express";
import { AssessmentService } from "../services/AssessmentService.js";

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

            let audioBuffer: Buffer | undefined;
            // express-fileupload attaches files to req.files
            if (req.files && req.files.audio) {
                const audioFile = Array.isArray(req.files.audio) ? req.files.audio[0] : req.files.audio;
                if (audioFile) {
                    audioBuffer = audioFile.data;
                }
            }

            const result = await AssessmentService.submitAssessment(test_id, responses, audioBuffer);
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
}
