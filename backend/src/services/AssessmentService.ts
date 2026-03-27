import { PromptTemplate } from "@langchain/core/prompts";
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

/**
 * Gemini is used for evaluation because it supports native audio input
 * and has a much larger output token limit (8k+) for detailed feedback.
 * Raw SDK is used to guarantee 'v1' stable endpoint usage.
 */
const genAI = new GoogleGenerativeAI(configs.GEMINI_API_KEY!);
const geminiModel = genAI.getGenerativeModel(
  { model: configs.GEMINI_MODEL || "gemini-2.0-flash" },
  { apiVersion: "v1" },
);

export class AssessmentService {
  private static toRecord(value: any): Record<string, any> {
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {};
  }

  private static normalizeAnswer(value: any): string {
    return String(value ?? "")
      .trim()
      .toLowerCase();
  }

  private static roundBand(value: number): number {
    return Math.max(0, Math.min(9, Number(value.toFixed(1))));
  }

  private static isFiniteBand(value: any): boolean {
    return Number.isFinite(Number(value));
  }

  private static computeObjectiveSubscore(
    questions: any[],
    sectionResponses: Record<string, any>,
  ): number | null {
    if (!Array.isArray(questions) || questions.length === 0) return null;
    const gradable = questions.filter(
      (q) => AssessmentService.normalizeAnswer(q?.correct_answer).length > 0,
    );
    if (gradable.length === 0) return null;

    let correct = 0;
    for (const q of gradable) {
      const key = String(q?.id ?? "");
      const expected = AssessmentService.normalizeAnswer(q?.correct_answer);
      const actual = AssessmentService.normalizeAnswer(sectionResponses[key]);
      if (actual && expected && actual === expected) correct += 1;
    }

    return AssessmentService.roundBand((correct / gradable.length) * 9);
  }

  private static mergeObjectiveScores(
    rawEvaluation: any,
    blueprint: any,
    responses: any,
  ) {
    const payload = AssessmentService.toRecord(rawEvaluation);
    const nested = AssessmentService.toRecord(payload.evaluation);
    const base = Object.keys(nested).length > 0 ? nested : payload;

    const subscores = AssessmentService.toRecord(base.subscores);

    const sections = AssessmentService.toRecord(
      AssessmentService.toRecord(blueprint?.data).sections,
    );
    const readingQuestions = Array.isArray(sections.reading?.questions)
      ? sections.reading.questions
      : [];
    const listeningQuestions = Array.isArray(sections.listening?.questions)
      ? sections.listening.questions
      : [];

    const readingScore = AssessmentService.computeObjectiveSubscore(
      readingQuestions,
      AssessmentService.toRecord(responses?.reading),
    );
    const listeningScore = AssessmentService.computeObjectiveSubscore(
      listeningQuestions,
      AssessmentService.toRecord(responses?.listening),
    );

    if (readingScore !== null) subscores.reading = readingScore;
    if (listeningScore !== null) subscores.listening = listeningScore;

    const numericSubscores = [
      subscores.reading,
      subscores.listening,
      subscores.writing,
      subscores.speaking,
    ]
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v));

    const overallBand =
      numericSubscores.length > 0
        ? AssessmentService.roundBand(
            numericSubscores.reduce((a, b) => a + b, 0) /
              numericSubscores.length,
          )
        : 0;

    base.subscores = subscores;
    if (
      !AssessmentService.isFiniteBand(base.overall_band) ||
      Number(base.overall_band) === 0
    ) {
      base.overall_band = overallBand;
    }

    if (Object.keys(nested).length > 0) {
      payload.evaluation = base;
      return payload;
    }
    return base;
  }

  private static safeTruncate(value: any, maxLength: number): string {
    const str = typeof value === "string" ? value : String(value ?? "");
    if (str.length <= maxLength) return str;
    return `${str.slice(0, maxLength)}...`;
  }

  private static compactQuestions(questions: any[], limit = 12) {
    if (!Array.isArray(questions)) return [];
    return questions.slice(0, limit).map((q: any, index: number) => ({
      id: q?.id ?? index + 1,
      question: AssessmentService.safeTruncate(
        q?.question || q?.prompt || "",
        300,
      ),
      options: Array.isArray(q?.options)
        ? q.options
            .slice(0, 8)
            .map((opt: any) => AssessmentService.safeTruncate(opt, 120))
        : [],
      correct_answer: AssessmentService.safeTruncate(
        q?.correct_answer || q?.correctAnswer || q?.answer || "",
        120,
      ),
    }));
  }

  private static buildCompactBlueprintForEvaluation(blueprint: any) {
    const data = blueprint?.data || blueprint || {};
    const sections = data?.sections || {};

    return {
      test_id: blueprint?.test_id || data?.test_id,
      exam_summary: {
        type: data?.exam_summary?.type || "IELTS",
        difficulty: data?.exam_summary?.difficulty || "Medium",
      },
      sections: {
        reading: {
          passage: AssessmentService.safeTruncate(
            sections?.reading?.passage || "",
            2800,
          ),
          questions: AssessmentService.compactQuestions(
            sections?.reading?.questions || [],
          ),
        },
        listening: {
          script: AssessmentService.safeTruncate(
            sections?.listening?.script || "",
            2800,
          ),
          questions: AssessmentService.compactQuestions(
            sections?.listening?.questions || [],
          ),
        },
        writing: {
          prompt: AssessmentService.safeTruncate(
            sections?.writing?.prompt || "",
            1200,
          ),
        },
        speaking: {
          prompt: AssessmentService.safeTruncate(
            sections?.speaking?.prompt || "",
            1200,
          ),
        },
      },
    };
  }

  private static buildCompactResponsesForEvaluation(responses: any) {
    return {
      reading: responses?.reading || {},
      listening: responses?.listening || {},
      writing: AssessmentService.safeTruncate(responses?.writing || "", 4000),
      speaking: AssessmentService.safeTruncate(responses?.speaking || "", 4000),
    };
  }

  private static isContextLengthExceededError(error: any): boolean {
    const message = String(error?.message || "").toLowerCase();
    return (
      message.includes("context_length_exceeded") ||
      message.includes("reduce the length") ||
      message.includes("token")
    );
  }

  private static shouldUseQueue(): boolean {
    return Boolean(configs.ASSESSMENT_USE_QUEUE && isRedisAvailable());
  }

  private static runEvaluationInBackground(
    testId: string,
    blueprint: any,
    responses: any,
    studentId: number,
    audioData?: { buffer: Buffer; mimetype: string },
  ): void {
    const activeState = { status: "active" };
    evaluationCache.set(testId, activeState);
    AssessmentService.cacheSet(`evaluation_status:${testId}`, activeState, 3600).catch(() => {});

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
        const successState = { status: "success", data: evalResult };
        evaluationCache.set(testId, successState);
        AssessmentService.cacheSet(`evaluation_status:${testId}`, successState, 3600).catch(() => {});
      })
      .catch((err) => {
        console.error("❌ Evaluation failed:", err.message);
        const errState = {
          status: "failed",
          reason: err.message,
        };
        evaluationCache.set(testId, errState);
        AssessmentService.cacheSet(`evaluation_status:${testId}`, errState, 3600).catch(() => {});
      });
  }

  private static async cacheSet(
    key: string,
    value: unknown,
    ttlSeconds = 7200,
  ): Promise<void> {
    if (!isRedisAvailable()) return;
    try {
      await redisConnection.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error: any) {
      console.warn(
        `[AssessmentService] Redis set failed for ${key}. Continuing without Redis cache: ${error?.message || error}`,
      );
    }
  }

  private static async cacheGet<T = any>(key: string): Promise<T | null> {
    if (!isRedisAvailable()) return null;
    try {
      const raw = await redisConnection.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (error: any) {
      console.warn(
        `[AssessmentService] Redis get failed for ${key}. Falling back to in-memory flow: ${error?.message || error}`,
      );
      return null;
    }
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
      `[AssessmentService] Generating ${examType} blueprint with Gemini...`,
    );
    
    const textPrompt = await prompt.format({ examType, difficulty, testId });
    const result = await geminiModel.generateContent(textPrompt);
    const response = result.response.text();

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

    await AssessmentService.cacheSet(`test_id:${testId}`, blueprint, 7200);
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
    } else {
      blueprint = await AssessmentService.cacheGet(`test_id:${testId}`);
    }

    if (!blueprint) throw new Error("Assessment not found.");

    if (!AssessmentService.shouldUseQueue()) {
      AssessmentService.runEvaluationInBackground(
        testId,
        blueprint,
        responses,
        studentId,
        audioData,
      );
      return { status: "submitted", jobId: testId, testId, sync: true };
    }

    let job;
    try {
      job = await assessmentQueue.add(
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
    } catch (error: any) {
      console.warn(
        `[AssessmentService] Queue add failed. Running sync fallback: ${error?.message || error}`,
      );
      AssessmentService.runEvaluationInBackground(
        testId,
        blueprint,
        responses,
        studentId,
        audioData,
      );

      return { status: "submitted", jobId: testId, testId, sync: true };
    }

    return { status: "submitted", jobId: job.id, testId };
  }

  static async evaluateAssessment(
    testId: string,
    blueprint: any,
    responses: any,
    studentId: number,
    audioData?: { base64: string; mimetype: string },
  ) {
    const compactBlueprint =
      AssessmentService.buildCompactBlueprintForEvaluation(blueprint);
    const compactResponses =
      AssessmentService.buildCompactResponsesForEvaluation(responses);

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
      blueprint: JSON.stringify(compactBlueprint),
      responses: JSON.stringify(compactResponses),
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
        `[AssessmentService] Evaluating with Gemini model ${configs.GEMINI_MODEL || "gemini-2.0-flash"} (Raw SDK)...`,
      );
      const startTime = Date.now();

      const result = await geminiModel.generateContent({
        contents: [{ role: "user", parts: messagesContent }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        },
      });

      response = result.response.text();
      const duration = (Date.now() - startTime) / 1000;
      console.log(
        `[AssessmentService] Evaluation received in ${duration}s. Parsing...`,
      );
    } catch (error: any) {
      console.error(
        `[AssessmentService] Primary Gemini evaluation failed (${configs.GEMINI_MODEL || "gemini-2.0-flash"}):`,
        error.message,
      );
      throw error;
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

    evaluation = AssessmentService.mergeObjectiveScores(
      evaluation,
      blueprint,
      responses,
    );

    await AssessmentService.cacheSet(`evaluation:${testId}`, evaluation, 7200);
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
      await LearningPathService.generateForStudent(
        studentId,
        evaluation,
        examType,
      );
    } catch (dbError) {
      console.error("Persistence failed:", dbError);
    }

    return evaluation;
  }

  static async getAssessmentResult(testId: string) {
    if (evaluationCache.has(testId)) return evaluationCache.get(testId);

    // In non-queue mode, status is driven by in-memory + Redis cache only.
    if (!AssessmentService.shouldUseQueue()) {
      const storedResult = await AssessmentService.cacheGet(
        `evaluation:${testId}`,
      );
      if (storedResult) return { status: "success", data: storedResult };

      const explicitStatus = await AssessmentService.cacheGet(
        `evaluation_status:${testId}`,
      );
      if (explicitStatus) return explicitStatus;

      return { status: "active" };
    }

    if (isRedisAvailable()) {
      const storedResult = await AssessmentService.cacheGet(
        `evaluation:${testId}`,
      );
      if (storedResult) return { status: "success", data: storedResult };

      try {
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
      } catch (error: any) {
        console.warn(
          `[AssessmentService] Queue result lookup failed for ${testId}: ${error?.message || error}`,
        );
      }
    }

    return { status: "active" };
  }

  static async getStudentProgress(studentId: number, examType?: string) {
    return await AssessmentRepository.getStudentProgress(studentId, examType);
  }
}
