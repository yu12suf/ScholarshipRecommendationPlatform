import { Request, Response } from "express";
import { WritingLabService } from "../services/WritingLabService.js";

export class WritingLabController {
  /**
   * Evaluates an essay submitted by a student.
   */
  static async evaluate(req: Request, res: Response) {
    try {
      const { essay, prompt, examType } = req.body;

      if (!essay || !prompt) {
        return res.status(400).json({
          message: "Essay and prompt are required.",
        });
      }

      const evaluation = await WritingLabService.evaluateEssay(
        essay,
        prompt,
        examType || "IELTS"
      );

      return res.json(evaluation);
    } catch (error: any) {
      console.error("[WritingLabController] Error evaluating essay:", error);
      return res.status(500).json({
        message: error.message || "Failed to evaluate essay.",
      });
    }
  }
}
