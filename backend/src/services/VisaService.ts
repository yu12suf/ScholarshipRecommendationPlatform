import configs from "../config/configs.js";
import { VisaMockInterview, VisaGuideline } from "../models/index.js";
import Groq from "groq-sdk";
import fs from "fs";

const groq = new Groq({ apiKey: configs.GROQ_API_KEY });

type InterviewEvaluation = {
  score: string;
  grammar: string;
  confidence: string;
  feedback: string;
  confidence_score: number;
  country_specific_flags: string[];
  focus_areas: string[];
  improvements: string[];
  evaluation_source?: string;
};

export class VisaService {
  static async getGuidelines(country: string) {
    return await VisaGuideline.findOne({
      where: { country },
    });
  }

  static async initiateCall(studentInfo: {
    studentId: number;
    studentName: string;
    university: string;
    country: string;
  }) {
    const { studentId, studentName, university, country } = studentInfo;

    const interview = await VisaMockInterview.create({
      studentId,
      country,
      status: "Pending",
    });

    const systemPrompt = `Role: Strict Consular Officer for ${country}
Greeting: You MUST start the conversation immediately by greeting the applicant and asking their purpose of travel.
Context:
- University: ${university}
- Applicant Name: ${studentName}
Rules:
- Be professional, firm, and slightly skeptical.
- Keep the interview concise: ask 5-7 focused questions.
- If the applicant is vague, ask follow-up questions.
- Focus on spoken interview performance, clarity, confidence, consistency, and credibility.
- Do not ask the applicant to show passport or upload documents.`;

    return {
      interviewId: interview.id,
      systemPrompt,
      firstMessage: `Good morning. I am the Consular Officer for ${country}. What is the purpose of your trip to ${university}?`
    };
  }

  static async transcribeAudio(filePath: string): Promise<string> {
    try {
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-large-v3",
      });
      return transcription.text;
    } finally {
      if (fs.existsSync(filePath)) {
        fs.promises.unlink(filePath).catch(console.error);
      }
    }
  }

  static async getChatCompletion(messages: any[], isJson: boolean = false): Promise<string> {
    const response = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      response_format: isJson ? { type: "json_object" } : { type: "text" },
    });
    return response.choices[0]?.message?.content || "";
  }

  static async evaluateCall(payload: {
    interviewId: string;
    transcript: Array<{ role: string; content: string }>;
  }) {
    const { interviewId, transcript } = payload;
    let interview = await VisaMockInterview.findByPk(interviewId);

    if (!interview) {
      throw new Error("Interview not found");
    }

    const evaluationPrompt = `
      You are an expert Visa Interview evaluator. Analyze the following interview transcript.
      You MUST provide your response in valid JSON format ONLY with the following schema:
      {
        "score": (string, e.g., "7.5/10" or "Band 7"),
        "grammar": (string, brief analysis of grammar and vocabulary),
        "confidence": (string, e.g., "High", "Moderate", "Low"),
        "feedback": (string, detailed suggestions for improvement),
        "confidence_score": (number 1-10 for internal use),
        "country_specific_flags": (array of strings),
        "focus_areas": (array of strings),
        "improvements": (array of strings)
      }

      Transcript:
      ${JSON.stringify(transcript)}
    `;

    try {
      const aiResponse = await this.getChatCompletion([{ role: "user", content: evaluationPrompt }], true);
      const evaluationData = JSON.parse(aiResponse);

      const evaluation: InterviewEvaluation = {
        ...evaluationData,
        evaluation_source: "groq_llama_evaluation"
      };

      await interview.update({
        transcript: transcript,
        aiEvaluation: evaluation,
        status: "Evaluated"
      });

      return evaluation;
    } catch (error) {
      console.error("[VisaService] Error during evaluation:", error);
      await interview.update({
        status: "Failed",
        aiEvaluation: {
          score: "N/A",
          grammar: "N/A",
          confidence: "N/A",
          feedback: "An error occurred while analyzing the transcript.",
          confidence_score: 0,
          country_specific_flags: ["Evaluation Error"],
          focus_areas: ["System Error"],
          improvements: ["Please retry the interview later."]
        }
      });
      throw error;
    }
  }
}
