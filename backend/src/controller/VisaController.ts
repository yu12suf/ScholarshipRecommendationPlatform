import { Request, Response, NextFunction } from "express";
import { VisaService } from "../services/VisaService.js";
import { Student } from "../models/Student.js";
import { VisaMockInterview } from "../models/VisaMockInterview.js";
import path from "path";
import os from "os";

export class VisaController {
  static async getGuidelines(req: Request, res: Response, next: NextFunction) {
    try {
      const country = req.params.country as string;
      let guidelines = await VisaService.getGuidelines(country);
      
      if (!guidelines) {
        // Fallback to prevent UI crash if country is not in DB
        guidelines = {
          country,
          visaType: "Student Visa",
          requiredDocuments: ["Valid Passport", "University Acceptance Letter", "Financial Proof"],
          tips: ["Be confident and clear.", "Speak directly to the officer.", "Always tell the truth."],
          commonQuestions: [
            "Why are you going to this country?",
            "Who is sponsoring your education?",
            "What are your plans after graduation?"
          ]
        } as any;
      }
      res.json({ status: "success", data: guidelines });
    } catch (error) {
      next(error);
    }
  }

  static async initiateCall(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { country, university } = req.body;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const student = await Student.findOne({ where: { userId }, include: ['user'] });
      if (!student) {
        res.status(404).json({ error: "Student not found" });
        return;
      }

      const result = await VisaService.initiateCall({
        studentId: student.id,
        studentName: student.user?.name || "Student",
        university: university || student.currentUniversity || "Foreign University",
        country
      });

      res.status(201).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async transcribeAudio(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.files || !req.files.file) {
        res.status(400).json({ error: "No audio file provided." });
        return;
      }

      const audioFile = req.files.file;
      const file = Array.isArray(audioFile) ? audioFile[0] : audioFile;

      if (!file) {
        res.status(400).json({ error: "Invalid audio file." });
        return;
      }

      const tempDir = os.tmpdir();
      const ext = path.extname(file.name) || '.m4a';
      const tempFilePath = path.join(tempDir, `upload_${Date.now()}${ext}`);

      await file.mv(tempFilePath);

      const transcribedText = await VisaService.transcribeAudio(tempFilePath);
      res.json({ status: "success", data: { text: transcribedText } });
    } catch (error) {
      next(error);
    }
  }

  static async chatResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const { messages, isJson } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Messages array is required." });
        return;
      }

      const responseText = await VisaService.getChatCompletion(messages, !!isJson);
      res.json({ status: "success", data: { content: responseText } });
    } catch (error) {
      next(error);
    }
  }

  static async getInterviewAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const interview = await VisaMockInterview.findByPk(id);
      
      if (!interview) {
        res.status(404).json({ error: "Interview not found" });
        return;
      }

      res.json({
        status: "success",
        data: {
          interviewId: interview.id,
          interviewStatus: interview.status,
          ready: interview.status === "Evaluated",
          analysis: interview.aiEvaluation || null,
          evaluation: interview.aiEvaluation || null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async finalizeInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { transcript } = req.body;

      if (!transcript || !Array.isArray(transcript)) {
        res.status(400).json({ error: "Transcript data is required for evaluation." });
        return;
      }

      const interview = await VisaMockInterview.findByPk(id);
      if (!interview) {
        res.status(404).json({ error: "Interview not found" });
        return;
      }

      if (interview.status === "Evaluated") {
        res.json({ status: "success", data: { interview, evaluation: interview.aiEvaluation } });
        return;
      }

      const evaluation = await VisaService.evaluateCall({
        interviewId: id,
        transcript
      });

      const updated = await VisaMockInterview.findByPk(id);
      
      res.json({
        status: "success",
        data: { interview: updated, evaluation },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const student = await Student.findOne({ where: { userId } });
      if (!student) {
        res.status(404).json({ error: "Student not found" });
        return;
      }

      const history = await VisaService.getStudentHistory(student.id);
      res.json({ status: "success", data: history });
    } catch (error) {
      next(error);
    }
  }
}