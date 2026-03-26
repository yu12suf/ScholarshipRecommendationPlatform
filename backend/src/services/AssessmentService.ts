import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { v4 as uuidv4 } from "uuid";
import configs from "../config/configs.js";
import {
  redisConnection,
  assessmentQueue,
  isRedisAvailable,
} from "../config/redis.js";
import { AssessmentResult } from "../models/AssessmentResult.js";
import { AssessmentRepository } from "../repositories/AssessmentRepository.js";
import { LearningPathService } from "./LearningPathService.js";
import { TTSService } from "./TTSService.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Local cache for non-redis environments
const blueprintCache = new Map<string, any>();
const evaluationCache = new Map<string, any>();

const groqModel = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: configs.GROQ_API_KEY!,
  temperature: 0.1,
  maxTokens: 4096,
});

/**
 * Gemini is used for evaluation because it supports native audio input
 * and has a much larger output token limit (8k+) for detailed feedback.
 * Raw SDK is used to guarantee 'v1' stable endpoint usage.
 */
const genAI = new GoogleGenerativeAI(configs.GEMINI_API_KEY!);
const geminiModel = genAI.getGenerativeModel(
  { model: configs.GEMINI_MODEL || "gemini-1.5-flash" },
  { apiVersion: "v1beta" },
);

export class AssessmentService {
  private static isModelUnavailableError(error: any): boolean {
    const message = String(error?.message || "").toLowerCase();
    const status = Number(error?.status || 0);
    return (
      status === 429 ||
      status === 404 ||
      message.includes("429") ||
      message.includes("404") ||
      message.includes("not found") ||
      message.includes("quota exceeded") ||
      message.includes("free_tier") ||
      message.includes("limit: 0")
    );
  }

  private static async evaluateWithGroqFallback(
    textPrompt: string,
    hadAudio: boolean,
  ): Promise<string> {
    const fallbackPrompt = `${textPrompt}\n\nFallback execution mode:\n- Primary Gemini evaluation was unavailable due to quota limits.\n- You must still return valid JSON in the required schema.\n- If audio was provided, evaluate speaking conservatively from textual evidence only and state this limitation inside feedback_report.\n- Keep output concise but complete.`;

    console.log(
      `[AssessmentService] Falling back to Groq evaluation${hadAudio ? " (audio approximated from text)" : ""}...`,
    );
    const startTime = Date.now();
    const chain = groqModel.pipe(new StringOutputParser());
    const response = await chain.invoke(fallbackPrompt);
    const duration = (Date.now() - startTime) / 1000;
    console.log(
      `[AssessmentService] Groq fallback evaluation received in ${duration}s. Parsing...`,
    );
    return response;
  }

  private static asObject(value: any): Record<string, any> {
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {};
  }

  private static pickFirstString(
    source: Record<string, any>,
    keys: string[],
  ): string {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) return value;
    }
    return "";
  }

  private static pickFirstArray(
    source: Record<string, any>,
    keys: string[],
  ): any[] {
    for (const key of keys) {
      const value = source[key];
      if (Array.isArray(value)) return value;
    }
    return [];
  }

  private static normalizeQuestion(
    question: any,
    fallbackPrefix: string,
    index: number,
  ) {
    const qObj = AssessmentService.asObject(question);
    const options = AssessmentService.pickFirstArray(qObj, [
      "options",
      "choices",
      "answers",
    ]).map((opt: any) => String(opt));

    return {
      question:
        AssessmentService.pickFirstString(qObj, [
          "question",
          "prompt",
          "text",
        ]) || `${fallbackPrefix} ${index + 1}`,
      options,
      correct_answer: AssessmentService.pickFirstString(qObj, [
        "correct_answer",
        "correctAnswer",
        "answer",
        "correct",
      ]),
      explanation: AssessmentService.pickFirstString(qObj, [
        "explanation",
        "reason",
      ]),
    };
  }

  private static normalizeSection(
    section: any,
    sectionName: "reading" | "listening",
  ) {
    const sectionObj = AssessmentService.asObject(section);
    const title = AssessmentService.pickFirstString(sectionObj, [
      "title",
      "heading",
      "name",
    ]);
    const passage = AssessmentService.pickFirstString(sectionObj, [
      "passage",
      "text",
      "content",
    ]);
    const script = AssessmentService.pickFirstString(sectionObj, [
      "script",
      "transcript",
      "audio_script",
      "text",
    ]);
    const rawQuestions = AssessmentService.pickFirstArray(sectionObj, [
      "questions",
      "items",
      "question_set",
      "questionSet",
      "reading_questions",
      "readingQuestions",
      "listening_questions",
      "listeningQuestions",
    ]);

    const questions = rawQuestions
      .map((q, idx) =>
        AssessmentService.normalizeQuestion(
          q,
          `${sectionName.toUpperCase()} Question`,
          idx,
        ),
      )
      .filter((q) => q.question);

    return {
      ...sectionObj,
      ...(title ? { title } : {}),
      ...(passage ? { passage } : {}),
      ...(script ? { script } : {}),
      questions,
    };
  }

  private static normalizeExamType(examType: string): "IELTS" | "TOEFL" {
    const value = (examType || "").trim().toUpperCase();
    if (value === "IELTS" || value === "TOEFL") return value;
    throw new Error("Unsupported examType. Use IELTS or TOEFL.");
  }

  private static normalizeDifficulty(
    difficulty: string,
  ): "Easy" | "Medium" | "Hard" {
    const value = (difficulty || "").trim().toLowerCase();
    if (value === "easy") return "Easy";
    if (value === "medium") return "Medium";
    if (value === "hard") return "Hard";
    throw new Error("Unsupported difficulty. Use Easy, Medium, or Hard.");
  }

  private static normalizeBlueprint(
    rawBlueprint: any,
    testId: string,
    examType: "IELTS" | "TOEFL",
    difficulty: "Easy" | "Medium" | "Hard",
  ) {
    const blueprint = AssessmentService.asObject(rawBlueprint);
    const data = AssessmentService.asObject(blueprint.data);
    const sections = AssessmentService.asObject(data.sections);

    // Support multiple response shapes from LLMs:
    // 1) data.sections.reading/listening
    // 2) sections.reading/listening
    // 3) top-level reading/listening
    // 4) data.reading/data.listening
    const readingSource =
      sections.reading ??
      AssessmentService.asObject(blueprint.sections).reading ??
      blueprint.reading ??
      data.reading;
    const listeningSource =
      sections.listening ??
      AssessmentService.asObject(blueprint.sections).listening ??
      blueprint.listening ??
      data.listening;

    const reading = AssessmentService.normalizeSection(
      readingSource,
      "reading",
    );
    const listening = AssessmentService.normalizeSection(
      listeningSource,
      "listening",
    );

    // If section-level question arrays are missing, try common top-level fallback arrays.
    if (!Array.isArray(reading.questions) || reading.questions.length === 0) {
      const fallbackReading = AssessmentService.pickFirstArray(blueprint, [
        "reading_questions",
        "readingQuestions",
      ]).concat(
        AssessmentService.pickFirstArray(data, [
          "reading_questions",
          "readingQuestions",
        ]),
      );
      if (fallbackReading.length) {
        reading.questions = fallbackReading.map((q, idx) =>
          AssessmentService.normalizeQuestion(q, "READING Question", idx),
        );
      }
    }

    if (
      !Array.isArray(listening.questions) ||
      listening.questions.length === 0
    ) {
      const fallbackListening = AssessmentService.pickFirstArray(blueprint, [
        "listening_questions",
        "listeningQuestions",
      ]).concat(
        AssessmentService.pickFirstArray(data, [
          "listening_questions",
          "listeningQuestions",
        ]),
      );
      if (fallbackListening.length) {
        listening.questions = fallbackListening.map((q, idx) =>
          AssessmentService.normalizeQuestion(q, "LISTENING Question", idx),
        );
      }
    }

    if (
      !Array.isArray(reading.questions) ||
      !Array.isArray(listening.questions) ||
      reading.questions.length === 0 ||
      listening.questions.length === 0
    ) {
      throw new Error(
        "Blueprint generation returned invalid schema (missing reading/listening questions).",
      );
    }

    return {
      ...blueprint,
      data: {
        ...data,
        test_id: testId,
        exam_summary: {
          ...(data.exam_summary || {}),
          type: data.exam_summary?.type || examType,
          difficulty: data.exam_summary?.difficulty || difficulty,
        },
        sections: {
          ...sections,
          reading,
          listening,
          writing: sections.writing || {},
          speaking: sections.speaking || {},
        },
      },
    };
  }

  public static sanitizeJSONString(str: string): string {
    const firstBrace = str.indexOf("{");
    const lastBrace = str.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) return str;
    let json = str.substring(firstBrace, lastBrace + 1);

    let result = "";
    let isInsideString = false;

    for (let i = 0; i < json.length; i++) {
      const char = json[i];
      if (!char) continue;

      if (char === '"' && (i === 0 || (json[i - 1] || "") !== "\\")) {
        isInsideString = !isInsideString;
        result += char;
        continue;
      }

      if (isInsideString) {
        if (char === "\\") {
          const nextChar = i + 1 < json.length ? json[i + 1] || "" : "";
          if (
            nextChar &&
            ['"', "\\", "/", "b", "f", "n", "r", "t", "u"].includes(nextChar)
          ) {
            result += char;
          } else if (nextChar === "'") {
            continue;
          } else {
            result += "\\\\";
          }
        } else if (char === "\n") {
          result += "\\n";
        } else if (char === "\r") {
          result += "\\r";
        } else if (char === "\t") {
          result += "\\t";
        } else if (char.charCodeAt(0) < 32) {
          // skip control
        } else {
          result += char;
        }
      } else {
        result += char;
      }
    }
    return result.replace(/,\s*([\]}])/g, "$1");
  }

  static async generateExam(examTypeInput: string, difficultyInput: string) {
    const examType = AssessmentService.normalizeExamType(examTypeInput);
    const difficulty = AssessmentService.normalizeDifficulty(difficultyInput);
    const testId = uuidv4();

    const prompt = PromptTemplate.fromTemplate(`
            Role: Senior Assessment Architect
            Task: Generate a complete {examType} blueprint.
            Difficulty: {difficulty}
            
            1. READING: 1 Passage + 5 Questions (with a hidden 'correct_answer' key).
            2. LISTENING: 1 Detailed Script + 5 Questions (with a hidden 'correct_answer' key).
            3. WRITING: 1 Task Prompt (Task 2 style for IELTS / Independent for TOEFL).
            4. SPEAKING: 1 Long-form Prompt (Cue Card or Integrated Task).
            5. STRICT RESPONSE KEYS (JSON only):
               - data.exam_summary.type: "{examType}"
               - data.exam_summary.difficulty: "{difficulty}"
               - data.sections.reading.passage: string
               - data.sections.reading.questions: array of 5 objects with keys question, options (array), correct_answer
               - data.sections.listening.script: string
               - data.sections.listening.questions: array of 5 objects with keys question, options (array), correct_answer
               - data.sections.writing.prompt: string
               - data.sections.speaking.prompt: string
            
            Return JSON only.
        `);

    console.log(
      `[AssessmentService] Generating ${examType} blueprint with Groq...`,
    );
    const chain = prompt.pipe(groqModel).pipe(new StringOutputParser());
    const response = await chain.invoke({ examType, difficulty, testId });

    let blueprint: any;
    let rawJson = "";
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      rawJson = jsonMatch ? jsonMatch[0] : response;
      const parsed = JSON.parse(AssessmentService.sanitizeJSONString(rawJson));
      blueprint = AssessmentService.normalizeBlueprint(
        parsed,
        testId,
        examType,
        difficulty,
      );
    } catch (error: any) {
      console.error("Failed to parse blueprint:", error.message);
      throw new Error(`Blueprint generation failed: ${error.message}`);
    }

    const listeningScript = blueprint.data?.sections?.listening?.script;
    if (listeningScript) {
      try {
        const audioBase64 =
          await TTSService.generateAudioBase64(listeningScript);
        if (audioBase64)
          blueprint.data.sections.listening.audio_base64 = audioBase64;
      } catch (ttsErr) {
        console.error("TTS failed:", ttsErr);
      }
    }

    if (isRedisAvailable()) {
      await redisConnection.set(
        `test_id:${testId}`,
        JSON.stringify(blueprint),
        "EX",
        7200,
      );
    }
    blueprintCache.set(testId, blueprint);

    const sanitizedData = JSON.parse(JSON.stringify(blueprint));
    if (Array.isArray(sanitizedData?.data?.sections?.reading?.questions)) {
      sanitizedData.data.sections.reading.questions.forEach(
        (q: any) => delete q.correct_answer,
      );
    }
    if (Array.isArray(sanitizedData?.data?.sections?.listening?.questions)) {
      sanitizedData.data.sections.listening.questions.forEach(
        (q: any) => delete q.correct_answer,
      );
    }

    return sanitizedData;
  }

  static async submitAssessment(
    testId: string,
    responses: any,
    studentId: number,
    audioData?: { buffer: Buffer; mimetype: string },
  ) {
    let blueprint;
    if (blueprintCache.has(testId)) {
      blueprint = blueprintCache.get(testId);
    } else if (isRedisAvailable()) {
      const blueprintData = await redisConnection.get(`test_id:${testId}`);
      if (blueprintData) blueprint = JSON.parse(blueprintData);
    }

    if (!blueprint) throw new Error("Assessment not found.");

    if (!isRedisAvailable()) {
      console.warn("⚠️ Redis unavailable, running evaluation synchronously...");
      AssessmentService.evaluateAssessment(
        testId,
        blueprint,
        responses,
        studentId,
        audioData
          ? {
              base64: audioData.buffer.toString("base64"),
              mimetype: audioData.mimetype,
            }
          : undefined,
      )
        .then((evalResult) => {
          evaluationCache.set(testId, { status: "success", data: evalResult });
        })
        .catch((err) => {
          console.error("❌ Evaluation failed:", err.message);
          evaluationCache.set(testId, {
            status: "failed",
            reason: err.message,
          });
        });
      return { status: "submitted", jobId: testId, testId, sync: true };
    }

    const job = await assessmentQueue.add(
      "assessment-queue",
      {
        testId,
        blueprint,
        responses,
        studentId,
        audioData: audioData
          ? {
              base64: audioData.buffer.toString("base64"),
              mimetype: audioData.mimetype,
            }
          : null,
      },
      { jobId: testId, removeOnComplete: false },
    );

    return { status: "submitted", jobId: job.id, testId };
  }

  static async evaluateAssessment(
    testId: string,
    blueprint: any,
    responses: any,
    studentId: number,
    audioData?: { base64: string; mimetype: string },
  ) {
    const promptTemplate = PromptTemplate.fromTemplate(`
            Role: English Proficiency Engine
            Task: Evaluate student responses based on the provided blueprint.
            
            Original Blueprint: {blueprint}
            Student Responses: {responses}
            Audio Provided: {hasAudio}
            
            1. GRADING:
               - Reading/Listening: Match against the blueprint key.
               - Writing: Evaluate based on Task Achievement, Cohesion, Lexical Resource, and Grammar.
               - Speaking: (If audio) Analyze Fluency, Pronunciation, and Content.
            2. ADAPTIVE MAPPING:
               - Identify "Weakness Tags" (e.g., "Present_Perfect", "Lexical_Diversity").
            3. INSTRUCTIONAL NOTES:
               - For EACH skill (Reading, Listening, Writing, Speaking), generate a detailed "Actionable Study Note" (minimum 400 characters each).
               - The note MUST include:
                 a) A clear explanation of the weakness identified.
                 b) Specific examples of where the student made mistakes in THIS assessment.
                 c) Step-by-step strategies to improve.
                 d) Recommended exercise types.
            4. LEARNING MODE PRACTICE:
               - For EACH skill, generate 2 original practice questions based on the identified weaknesses.
               - Each question must include the text/prompt, options (if applicable), the correct answer, and a clear explanation of WHY it is correct.
            
            Return JSON in the following schema:
            {{
              "evaluation": {{
                "overall_band": 0.0,
                "subscores": {{ "reading": 0, "listening": 0, "writing": 0, "speaking": 0 }},
                "feedback_report": "Overall feedback summary",
                "section_notes": {{ 
                  "reading": "Detailed 400+ char note with examples for reading", 
                  "listening": "Detailed 400+ char note with examples for listening", 
                  "writing": "Detailed 400+ char note with examples for writing", 
                  "speaking": "Detailed 400+ char note with examples for speaking" 
                }},
                "learning_mode": {{
                  "reading": [{{ "question": "string", "options": [], "answer": "string", "explanation": "string" }}],
                  "listening": [{{ "question": "string", "options": [], "answer": "string", "explanation": "string" }}],
                  "writing": [{{ "prompt": "string", "sample_answer": "string", "explanation": "string" }}],
                  "speaking": [{{ "prompt": "string", "tips": "string", "sample_response": "string" }}]
                }},
                "adaptive_learning_tags": []
              }}
            }}

            CRITICAL JSON FORMATTING RULES:
            - The output MUST be strictly valid JSON.
            - Do NOT include literal newline characters (\\n), carriage returns (\\r), or tabs (\\t) unescaped inside JSON string values.
            - If you need a line break inside a string, use the escaped sequence "\\n" instead of a real line break.
            - Double quotes inside string values MUST be escaped as "\\"".
            - NEVER use single quotes for property names or values. ONLY use double quotes ("key": "value").
            - Do NOT add trailing commas at the end of lists or objects.
        `);

    const textPrompt = await promptTemplate.format({
      blueprint: JSON.stringify(blueprint),
      responses: JSON.stringify(responses),
      hasAudio: audioData ? "Yes" : "No",
    });

    const messagesContent: any[] = [{ text: textPrompt }];
    if (audioData) {
      messagesContent.push({
        inlineData: {
          mimeType: audioData.mimetype || "audio/mp3",
          data: audioData.base64,
        },
      });
    }

    let response = "";
    try {
      console.log(
        `[AssessmentService] Evaluating with Gemini model ${configs.GEMINI_MODEL || "gemini-1.5-flash"} (Raw SDK)...`,
      );
      const startTime = Date.now();
      
      const result = await geminiModel.generateContent({
        contents: [{ role: "user", parts: messagesContent }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        }
      });
      
      response = result.response.text();
      const duration = (Date.now() - startTime) / 1000;
      console.log(
        `[AssessmentService] Evaluation received in ${duration}s. Parsing...`,
      );
    } catch (error: any) {
      console.error(`[AssessmentService] Primary Gemini evaluation failed (${configs.GEMINI_MODEL || "gemini-1.5-flash"}):`, error.message);
      if (AssessmentService.isModelUnavailableError(error)) {
        response = await AssessmentService.evaluateWithGroqFallback(
          textPrompt,
          Boolean(audioData),
        );
      } else {
        throw error;
      }
    }

    let evaluation;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const rawJson = jsonMatch ? jsonMatch[0] : response;
      evaluation = JSON.parse(AssessmentService.sanitizeJSONString(rawJson));
    } catch (error: any) {
      console.error("Failed to parse evaluation:", error.message);
      throw error;
    }

    if (isRedisAvailable()) {
      await redisConnection.set(
        `evaluation:${testId}`,
        JSON.stringify(evaluation),
        "EX",
        7200,
      );
    }
    evaluationCache.set(testId, { status: "success", data: evaluation });

    try {
      const overallBand = evaluation.evaluation?.overall_band || 0;
      await AssessmentRepository.create({
        studentId,
        testId,
        examType: blueprint.data?.exam_summary?.type || "Unknown",
        difficulty: blueprint.data?.exam_summary?.difficulty || "Unknown",
        evaluation,
        overallBand,
      });
      const examType = (blueprint.data?.exam_summary?.type || "IELTS") as any;
      await LearningPathService.generateForStudent(studentId, evaluation, examType);
    } catch (dbError) {
      console.error("Persistence failed:", dbError);
    }

    return evaluation;
  }

  static async getAssessmentResult(testId: string) {
    if (evaluationCache.has(testId)) return evaluationCache.get(testId);

    if (isRedisAvailable()) {
      const storedResult = await redisConnection.get(`evaluation:${testId}`);
      if (storedResult)
        return { status: "success", data: JSON.parse(storedResult) };

      const job = await assessmentQueue.getJob(testId);
      if (!job) return { status: "not_found" };

      const state = await job.getState();
      if (state === "completed")
        return { status: "success", data: job.returnvalue };
      if (state === "failed")
        return {
          status: "failed",
          reason:
            job.failedReason ||
            "Evaluation job failed. Check worker logs for details.",
        };
      return { status: state };
    }

    return { status: "active" };
  }

  static async getStudentProgress(studentId: number, examType?: string) {
    return await AssessmentRepository.getStudentProgress(studentId, examType);
  }
}
