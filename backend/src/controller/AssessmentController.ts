import { Request, Response, NextFunction } from "express";
import { AssessmentService } from "../services/AssessmentService.js";
import { StudentRepository } from "../repositories/StudentRepository.js";

export class AssessmentController {
  static async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const examType =
        typeof req.body?.examType === "string" ? req.body.examType.trim() : "";
      const difficulty =
        typeof req.body?.difficulty === "string"
          ? req.body.difficulty.trim()
          : "";

      if (!examType || !difficulty) {
        res.status(400).json({ error: "examType and difficulty are required" });
        return;
      }

      const examTypeUpper = examType.toUpperCase();
      const difficultyLower = difficulty.toLowerCase();
      if (!["IELTS", "TOEFL"].includes(examTypeUpper)) {
        res.status(400).json({ error: "examType must be IELTS or TOEFL" });
        return;
      }
      if (!["easy", "medium", "hard"].includes(difficultyLower)) {
        res
          .status(400)
          .json({ error: "difficulty must be Easy, Medium, or Hard" });
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
      const { test_id, responses: rawResponses } = req.body;
      if (!test_id || !rawResponses) {
        res.status(400).json({ error: "test_id and responses are required" });
        return;
      }

      // Normalize responses: may arrive as a JSON string (multipart) or object (JSON body)
      let parsedResponses = rawResponses;
      if (typeof rawResponses === "string") {
        try {
          parsedResponses = JSON.parse(rawResponses);
        } catch (e) {
          res
            .status(400)
            .json({
              error:
                "responses must be a valid JSON object or stringified JSON",
            });
          return;
        }
      }

      let audioData: { buffer: Buffer; mimetype: string } | undefined;
      // express-fileupload attaches files to req.files
      if (req.files && req.files.audio) {
        const audioFile = Array.isArray(req.files.audio)
          ? req.files.audio[0]
          : req.files.audio;
        if (audioFile) {
          audioData = {
            buffer: audioFile.data,
            mimetype: audioFile.mimetype,
          };
        }
      }

      const student = await StudentRepository.findByUserId(req.user!.id);
      if (!student) {
        res.status(404).json({ error: "Student profile not found" });
        return;
      }

      const result = await AssessmentService.submitAssessment(
        test_id,
        parsedResponses,
        student.id,
        audioData,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { test_id } = req.params;
      if (!test_id || typeof test_id !== "string") {
        res
          .status(400)
          .json({ error: "test_id is required and must be a string" });
        return;
      }

      const result = await AssessmentService.getAssessmentResult(test_id);

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
      const progress = await AssessmentService.getStudentProgress(
        student.id as number,
        examType,
      );
      res.json({
        status: "success",
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }
}
