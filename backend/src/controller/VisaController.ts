
import { Request, Response, NextFunction } from "express";
import { VisaService } from "../services/VisaService.js";
import { Student } from "../models/Student.js";
import { VisaMockInterview } from "../models/VisaMockInterview.js";

export class VisaController {
  static async getGuidelines(req: Request, res: Response, next: NextFunction) {
    try {
      const country = req.params.country as string;
      const guidelines = await VisaService.getGuidelines(country);
      if (!guidelines) {
        res.status(404).json({ error: "Guidelines not found for this country" });
        return;
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

  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const message = req.body?.message ?? req.body;
      const messageType = String(message?.type || "").toLowerCase();

      // Handle Call Start
      if (messageType === "call-start") {
        const callId = message?.call?.id;
        const interviewId = message?.metadata?.interviewId || message?.call?.metadata?.interviewId;
          
        if (interviewId && callId) {
          const interview = await VisaMockInterview.findByPk(interviewId);
          if (interview && !interview.vapiCallId) {
            await interview.update({ vapiCallId: callId });
          }
        }
      }

      // Handle Call End / Report
      if (messageType === "end-of-call-report" || messageType === "end-of-call") {
        const callId = message?.call?.id;
        const interviewId = message?.metadata?.interviewId || message?.call?.metadata?.interviewId;
        const providerReport = message?.analysis || message?.call?.analysis;

        const evaluation = await VisaService.evaluateCall({
          vapiCallId: callId,
          transcript: message?.transcript || message?.call?.transcript,
          recordingUrl: message?.recordingUrl || message?.call?.recordingUrl,
          interviewId,
          providerReport,
        });

        res.status(200).json({
          status: "received",
          event: messageType,
          data: { interviewId, callId, evaluation },
        });
        return;
      }

      res.status(200).json({ status: "received" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error", details: (error as Error).message });
    }
  }

  static async getInterviewStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      let interview = await VisaMockInterview.findByPk(id);
      
      if (!interview) {
        res.status(404).json({ error: "Interview not found" });
        return;
      }

      if (interview.status !== "Evaluated" && interview.status !== "Failed" && interview.vapiCallId) {
        await VisaService.syncCallFromAPI(interview.id);
        const reloaded = await VisaMockInterview.findByPk(id);
        if (reloaded) interview = reloaded;
      }

      res.json({ status: "success", data: interview });
    } catch (error) {
      next(error);
    }
  }

  static async getInterviewAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const forceSync = String(req.query.forceSync ?? "true").toLowerCase() !== "false";

      let interview = await VisaMockInterview.findByPk(id);
      if (!interview) {
        res.status(404).json({ error: "Interview not found" });
        return;
      }

      // Polling fallback mechanism
      if (forceSync && interview.status !== "Evaluated" && interview.status !== "Failed" && interview.vapiCallId) {
        await VisaService.syncCallFromAPI(interview.id);
        const reloaded = await VisaMockInterview.findByPk(id);
        if (reloaded) interview = reloaded;
      }

      const liveAnalysis = interview.vapiCallId ? await VisaService.fetchVapiAnalysisByCallId(interview.vapiCallId) : null;

      const analysis = interview.aiEvaluation || liveAnalysis?.analysis || null;
      const evaluation = analysis?.structuredData || null;

      res.json({
        status: "success",
        data: {
          interviewId: interview.id,
          interviewStatus: interview.status,
          ready: Boolean(analysis),
          analysis,
          evaluation,
          rawAnalysis: liveAnalysis?.analysis || null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async finalizeInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      let interview = await VisaMockInterview.findByPk(id);
      
      if (!interview) {
        res.status(404).json({ error: "Interview not found" });
        return;
      }

      if (interview.status !== "Evaluated" && interview.status !== "Failed" && interview.vapiCallId) {
        await VisaService.syncCallFromAPI(interview.id);
        const reloaded = await VisaMockInterview.findByPk(id);
        if (reloaded) interview = reloaded;
      }

      if (interview.status === "Evaluated") {
        res.json({ status: "success", data: { interview, evaluation: interview.aiEvaluation } });
        return;
      }

      if (interview.status === "Failed") {
        res.json({ status: "success", data: { interview, queued: false, message: "Evaluation failed. Please retry." } });
        return;
      }

      await interview.update({ status: "Completed" });
      const updated = await VisaMockInterview.findByPk(id);
      
      res.json({
        status: "success",
        data: { interview: updated, queued: true, message: "Waiting for Vapi evaluation." },
      });
    } catch (error) {
      next(error);
    }
  }
}