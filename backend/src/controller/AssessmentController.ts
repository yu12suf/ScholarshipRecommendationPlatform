import { Request, Response, NextFunction } from "express";
import { AssessmentService } from "../services/AssessmentService.js";
import { StudentRepository } from "../repositories/StudentRepository.js";
import { LearningPathRepository } from "../repositories/LearningPathRepository.js";

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

      if (req.user?.id && !req.body?.force) {
        const student = await StudentRepository.findByUserId(req.user.id);
        if (student) {
          const path = await LearningPathRepository.findByStudentId(student.id);
          if (path && path.currentProgressPercentage < 100) {
            res.status(403).json({
              error: "Learning path completion required.",
              message: "You must complete 100% of your learning path before generating a mock exam.",
              currentProgress: path.currentProgressPercentage
            });
            return;
          }
        }
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
      const { isRedisAvailable } = await import("../config/redis.js");
      if (!isRedisAvailable()) {
        console.error("[AssessmentController] ❌ Redis is unavailable. Cannot submit job.");
        res.status(503).json({ error: "Assessment service is temporarily unavailable (Redis down)." });
        return;
      }

      const result = await AssessmentService.submitAssessment(
        test_id,
        parsedResponses,
        student.id,
        audioData,
      );
      console.log(`[AssessmentController] ✅ Job added to queue for test_id: ${test_id}`);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async submitSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { test_id, skill, responses } = req.body;
      const parsedResponses = typeof responses === "string" ? JSON.parse(responses) : responses;

      let audioData: { buffer: Buffer; mimetype: string } | undefined;
      if (req.files && req.files.audio) {
        const audioFile = Array.isArray(req.files.audio) ? req.files.audio[0] : req.files.audio;
        if (audioFile) {
          audioData = { buffer: audioFile.data, mimetype: audioFile.mimetype };
        }
      }

      const student = await StudentRepository.findByUserId(req.user!.id);
      if (!student) {
        res.status(404).json({ error: "Student profile not found" });
        return;
      }

      const result = await AssessmentService.evaluateSkillSection(
        test_id,
        skill,
        parsedResponses,
        student.id,
        audioData
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
