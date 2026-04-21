import { Request, Response } from "express";
import { AssessmentService } from "../services/AssessmentService.js";

export class SpeakingLabController {
  /**
   * Evaluates a speaking recording submitted by a student.
   */
  static async evaluate(req: Request, res: Response) {
    try {
      const { prompt, examType } = req.body;
      const files = req.files as any;
      const audioFile = files?.audio;

      if (!audioFile) {
        return res.status(400).json({
          message: "Audio recording is required.",
        });
      }

      const buffer = Array.isArray(audioFile) ? audioFile[0].data : audioFile.data;

      // We use the existing AssessmentService logic for speaking evaluation
      const evaluation = await AssessmentService.evaluateSpeakingDirect(
        buffer,
        prompt,
        examType || "IELTS"
      );

      return res.json(evaluation);
    } catch (error: any) {
      console.error("[SpeakingLabController] Error evaluating speaking:", error);
      return res.status(500).json({
        message: error.message || "Failed to evaluate speaking.",
      });
    }
  }
}
