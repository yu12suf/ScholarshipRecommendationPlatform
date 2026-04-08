import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { v4 as uuidv4 } from "uuid";
import configs from "../config/configs.js";
import { redisConnection, assessmentQueue } from "../config/redis.js";
import { AssessmentResult } from "../models/AssessmentResult.js"; // Keeping for type if needed, or remove if unused
import { AssessmentRepository } from "../repositories/AssessmentRepository.js";
import { LearningPathService } from "./LearningPathService.js";
import { TTSService } from "./TTSService.js";

const model = new ChatGoogleGenerativeAI({
  model: configs.GEMINI_MODEL as string,
  apiKey: configs.GEMINI_API_KEY as string,
  temperature: 0.0,
  maxOutputTokens: 16384, // Increased to avoid truncation on detailed evaluations
});

export class AssessmentService {
  public static sanitizeJSONString(str: string): string {
    let cleaned = str.trim();
    // 1. Remove markdown fragments if they exist anywhere
    cleaned = cleaned.replace(/```json\s?/g, "");
    cleaned = cleaned.replace(/```\s?/g, "");

    // 2. Extract the actual JSON block using first { and last }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // 3. Remove control characters
    cleaned = cleaned.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F]/g, "");

    return cleaned.trim();
  }

  /**
   * Attempts to fix a truncated JSON string by appending missing closing braces.
   */
  private static rescueTruncatedJSON(jsonStr: string): string {
    let str = jsonStr.trim();
    const openBraces = (str.match(/\{/g) || []).length;
    const closeBraces = (str.match(/\}/g) || []).length;
    const openBrackets = (str.match(/\[/g) || []).length;
    const closeBrackets = (str.match(/\]/g) || []).length;

    // If it ends mid-key or mid-value, try to close it roughly
    if (str.endsWith(",") || str.split('"').length % 2 === 0) {
      // Very rough trim to last safe end if in middle of string
      if (str.split('"').length % 2 === 0) {
        const lastQuote = str.lastIndexOf('"');
        str = str.substring(0, lastQuote);
      }
      str = str.replace(/,$/, "");
    }

    for (let i = 0; i < openBrackets - closeBrackets; i++) str += "]";
    for (let i = 0; i < openBraces - closeBraces; i++) str += "}";

    return str;
  }

  /**
   * Reduces the size of the blueprint for evaluation to save tokens.
   * It removes the heavy passage and script texts while keeping the essential "Grading Key."
   */
  private static stripBlueprintForEvaluation(blueprint: any): any {
    // Deep clone the blueprint so we don't modify the one in memory/Redis
    const mini = JSON.parse(JSON.stringify(blueprint));
    const sections = mini.data?.sections;

    if (sections) {
      // 1. Strip Reading: Remove 500+ word passage
      if (sections.reading) {
        delete sections.reading.passage;
        if (Array.isArray(sections.reading.questions)) {
          sections.reading.questions = sections.reading.questions.map(
            (q: any) => ({
              id: q.id,
              text: q.text,
              correct_answer: q.correct_answer,
            }),
          );
        }
      }

      // 2. Strip Listening: Remove 300+ word script and base64 audio
      if (sections.listening) {
        delete sections.listening.script;
        delete sections.listening.audio_base64;
        if (Array.isArray(sections.listening.questions)) {
          sections.listening.questions = sections.listening.questions.map(
            (q: any) => ({
              id: q.id,
              text: q.text,
              correct_answer: q.correct_answer,
            }),
          );
        }
      }
    }
    return mini;
  }

  static async generateExam(
    examType: "IELTS" | "TOEFL",
    difficulty: "Easy" | "Medium" | "Hard",
  ) {
    const testId = uuidv4();

    const prompt = PromptTemplate.fromTemplate(`
            Role: Senior Assessment Architect
            Task: Generate a complete {examType} blueprint.
            Difficulty: {difficulty}
            
            1. READING: 1 Passage + 5 Questions (with a hidden 'correct_answer' key).
            2. LISTENING: 1 Detailed Script + 5 Questions (with a hidden 'correct_answer' key).
            3. WRITING: 1 Task Prompt (Task 2 style for IELTS / Independent for TOEFL).
            4. SPEAKING: 1 Long-form Prompt (Cue Card or Integrated Task).
            
            Difficulty Constraints:
            - Easy: Simple syntax, daily vocabulary.
            - Medium: Academic context, compound sentences.
            - Hard: Complex logic, academic jargon.
            
            Return JSON in the following schema:
            {{
              "status": "success",
              "data": {{
                "test_id": "{testId}",
                "exam_summary": {{ "type": "{examType}", "difficulty": "{difficulty}" }},
                "sections": {{
                  "reading": {{ "passage": "string", "questions": [{{ "id": 1, "question": "string", "options": [], "correct_answer": "string" }}] }},
                  "listening": {{ "script": "string", "questions": [{{ "id": 1, "question": "string", "options": [], "correct_answer": "string" }}] }},
                  "writing": {{ "prompt": "string" }},
                  "speaking": {{ "prompt": "string" }}
                }}
              }}
            }}

            CRITICAL JSON FORMATTING RULES:
            - Ensure output is strictly VALID JSON.
            - Do NOT include literal newline characters (\\n), carriage returns (\\r), or tabs (\\t) unescaped inside JSON string values.
            - If you need a line break inside a string, use the escaped sequence "\\n" instead of a real line break.
            - NEVER use single quotes for keys or values. ONLY use double quotes ("key": "value").
            - Do NOT add trailing commas at the end of JSON objects or arrays.
        `);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const response = await chain.invoke({ examType, difficulty, testId });

    // Ensure response is valid JSON
    let blueprint;
    let rawJson = "";
    try {
      // Some models might wrap JSON in markdown blocks
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      rawJson = jsonMatch ? jsonMatch[0] : response;
      blueprint = JSON.parse(AssessmentService.sanitizeJSONString(rawJson));
    } catch (error) {
      console.error("Failed to parse AI response as JSON:", response);
      console.error(
        "Sanitized JSON:",
        AssessmentService.sanitizeJSONString(rawJson),
      );
      throw new Error(
        "Assessment generation failed due to invalid AI response.",
      );
    }

    // Force the testId to match what we generated to avoid AI hallucinations
    if (blueprint.data) {
      blueprint.data.test_id = testId;
    }

    // Generate audio for listening section
    const listeningScript = blueprint.data?.sections?.listening?.script;
    if (listeningScript) {
      try {
        const audioBase64 =
          await TTSService.generateAudioBase64(listeningScript);
        if (audioBase64) {
          blueprint.data.sections.listening.audio_base64 = audioBase64;
        }
      } catch (ttsErr) {
        console.error("Failed to generate audio for listening script:", ttsErr);
      }
    }

    // Store full blueprint in Redis for 2 hours
    await redisConnection.set(
      `test_id:${testId}`,
      JSON.stringify(blueprint),
      "EX",
      7200,
    );
    // Sanitize for frontend
    const sanitized = JSON.parse(JSON.stringify(blueprint));
    sanitized.data.sections.reading.questions.forEach(
      (q: any) => delete q.correct_answer,
    );
    sanitized.data.sections.listening.questions.forEach(
      (q: any) => delete q.correct_answer,
    );

    return sanitized;
  }

  static async submitAssessment(
    testId: string,
    responses: any,
    studentId: number,
    audioData?: { buffer: Buffer; mimetype: string },
  ) {
    // Fetch blueprint from Redis
    const blueprintData = await redisConnection.get(`test_id:${testId}`);
    if (!blueprintData) {
      throw new Error("Assessment not found or expired.");
    }

    const job = await assessmentQueue.add(
      "assessment-queue",
      {
        testId,
        blueprint: JSON.parse(blueprintData),
        responses,
        studentId,
        audioData: audioData
          ? {
              base64: audioData.buffer.toString("base64"),
              mimetype: audioData.mimetype,
            }
          : null,
      },
      {
        jobId: testId,
        removeOnComplete: false,
        removeOnFail: { age: 24 * 3600 },
      },
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
    // ... (existing code omitted for brevity but actually kept in full
  
    const promptTemplate = PromptTemplate.fromTemplate(`
    Role: Lead Adaptive Curriculum Architect
    Task: Evaluate student responses, perform a Competency Gap Analysis, and create an Adaptive Curriculum Map for an Ethiopian student preparing for an international exam.
    
    Original Blueprint (Stripped for tokens): {blueprint}
    Student Responses: {responses}
    Audio Provided: {hasAudio}
    
    1. DIAGNOSTIC ASSESSMENT (GRADING):
       - IELTS/TOEFL scoring logic...
    
    2. COMPETENCY GAP ANALYSIS:
       - Proficiency Profile and CEFR standards...
    
    3. ADAPTIVE CURRICULUM MAP:
       - Structured Sprints and Decision Logic...
    
    4. INSTRUCTIONAL NOTES & FEEDBACK:
       - Skill-specific actionable notes (min 500 characters) in Ethiopian context.
    
    5. LEARNING MODE PRACTICE:
       - Generate 3-5 original practice questions.
    
    Return JSON in the following schema:
    {{
      "evaluation": {{
        "overall_band": 0.0,
        "score_breakdown": {{ "reading": 0.0, "listening": 0.0, "writing": 0.0, "speaking": 0.0 }},
        "competency_gap_analysis": {{
          "proficiency_profile": "string",
          "weaknesses": ["string"],
          "section_analysis": {{ "reading": "string", "listening": "string", "writing": "string", "speaking": "string" }}
        }},
        "adaptive_curriculum_map": {{
          "sprints": [ {{ "week": 1, "goal": "string", "tasks": ["string"], "is_remedial": false }} ],
          "vocabulary_packs": [ {{ "topic": "string", "words": [ {{ "word": "string", "meaning": "string", "example": "string" }} ] }} ]
        }},
        "feedback_report": "Overall feedback summary",
        "section_notes": {{ 
          "reading": "string", 
          "listening": "string", 
          "writing": "string", 
          "speaking": "string" 
        }},
        "learning_mode": {{
          "reading": [ {{ "question": "string", "options": [], "answer": "string", "explanation": "string" }} ],
          "listening": {{
            "script": "string",
            "questions": [ {{ "question": "string", "options": [], "answer": "string", "explanation": "string" }} ]
          }},
          "writing": [ {{ "prompt": "string", "sample_answer": "string", "explanation": "string" }} ],
          "speaking": [ {{ "prompt": "string", "tips": "string", "sample_response": "string" }} ]
        }},
        "adaptive_learning_tags": ["string"]
      }}
    }}

    CRITICAL JSON FORMATTING RULES:
    - Return ONLY valid JSON.
    - Escape newlines as \\n.
`);


    // OPTIMIZATION: Stripping blueprint text to save input tokens (~90% reduction)
    const strippedBlueprint =
      AssessmentService.stripBlueprintForEvaluation(blueprint);

    const textPrompt = await promptTemplate.format({
      blueprint: JSON.stringify(strippedBlueprint),
      responses: JSON.stringify(responses),
      hasAudio: audioData ? "Yes" : "No",
    });

    const messagesContent: any[] = [{ type: "text", text: textPrompt }];
    if (audioData && audioData.base64) {
      messagesContent.push({
        type: "media",
        mimeType: audioData.mimetype || "audio/mp3",
        data: audioData.base64,
      });
    }

    // We use HumanMessage directly for multimodal structure instead of the plain String Output
    const { HumanMessage } = await import("@langchain/core/messages");
    const chain = model.pipe(new StringOutputParser());
    const response = await chain.invoke([
      new HumanMessage({ content: messagesContent }),
    ]);

    let evaluation;
    let rawJson = "";
    try {
      rawJson = AssessmentService.sanitizeJSONString(response);
      try {
        evaluation = JSON.parse(rawJson);
      } catch (innerError) {
        // AI truncated? Attempt rescue.
        const rescued = AssessmentService.rescueTruncatedJSON(rawJson);
        evaluation = JSON.parse(rescued);
        console.warn("⚠️ AI response was truncated but rescued successfully.");
      }
      console.log("✅ Evaluation Parsed Successfully");
    } catch (error) {
      console.error("❌ Failed to parse evaluation AI response:", response);
      console.error("Sanitized JSON that failed parsing:", rawJson);
      throw new Error(
        "Assessment evaluation failed due to invalid AI response.",
      );
    }

    // Generate audio for learning mode listening script
    const learningModeListening = evaluation.evaluation?.learning_mode?.listening;
    if (learningModeListening && learningModeListening.script) {
      try {
        const audioBase64 = await TTSService.generateAudioBase64(
          learningModeListening.script,
        );
        if (audioBase64) {
          learningModeListening.audio_base64 = audioBase64;
        }
      } catch (ttsErr) {
        console.error(
          "Failed to generate audio for learning mode listening script:",
          ttsErr,
        );
      }
    }

    // Store result in Redis
    await redisConnection.set(
      `evaluation:${testId}`,
      JSON.stringify(evaluation),
      "EX",
      7200,
    );

    // Persistent storage for student progress
    try {
      const overallBand = evaluation.evaluation?.overall_band || 0;
      const examType = blueprint.data?.exam_summary?.type || "Unknown";
      const difficulty = blueprint.data?.exam_summary?.difficulty || "Unknown";

      await AssessmentRepository.create({
        studentId,
        testId,
        examType,
        difficulty,
        evaluation,
        scoreBreakdown: evaluation.evaluation?.score_breakdown || null,
        overallBand,
      });

      // Trigger Learning Path Generation
      await LearningPathService.generateForStudent(
        studentId,
        evaluation,
        (blueprint.data?.exam_summary?.type ||
          blueprint.exam_summary?.type ||
          "IELTS") as "IELTS" | "TOEFL",
      );
    } catch (dbError: any) {
      console.error(
        "❌ Failed to store assessment result or generate learning path:",
        dbError.message,
      );
      console.error(dbError);
    }

    return evaluation;
  }

  static async getAssessmentResult(testId: string) {
    // ... (existing code)
    // Note: keeping existing logic for fetching from Redis/Queue for immediate result
    // Try explicit Redis key first
    const storedResult = await redisConnection.get(`evaluation:${testId}`);
    if (storedResult) {
      return { status: "success", data: JSON.parse(storedResult) };
    }

    const job = await assessmentQueue.getJob(testId);

    if (!job) {
      return {
        status: "not_found",
        message: "Assessment not found or expired",
      };
    }

    const state = await job.getState(); // 'completed', 'failed', 'active', 'waiting'

    if (state === "completed") {
      return {
        status: "success",
        // This is where BullMQ stores the result of the worker's return statement
        data: job.returnvalue,
      };
    }

    if (state === "failed") {
      return { status: "failed", reason: job.failedReason };
    }

    // Return the current state (waiting or active) instead of null
    return { status: state };
  }

  static async getStudentProgress(studentId: number, examType?: string) {
    return await AssessmentRepository.getStudentProgress(studentId, examType);
  }
}
