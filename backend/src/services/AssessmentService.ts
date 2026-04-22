import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { v4 as uuidv4 } from "uuid";
import configs from "../config/configs.js";
import { redisConnection, assessmentQueue } from "../config/redis.js";
import { AssessmentResult } from "../models/AssessmentResult.js"; 
import { AssessmentRepository } from "../repositories/AssessmentRepository.js";
import { LearningPathService } from "./LearningPathService.js";
import { TTSService } from "./TTSService.js";
import { Job } from "bullmq";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import os from "os";

const groqClient = new Groq({
  apiKey: configs.GROQ_API_KEY as string,
});

// Providers
const geminiModel = new ChatGoogleGenerativeAI({
  model: configs.GEMINI_MODEL as string || "gemini-1.5-flash",
  apiKey: configs.GEMINI_API_KEY as string,
  temperature: 0.1,
  maxOutputTokens: 16384,
  maxRetries: 2,
});

// Groq 8B (Speed Specialist for Writing)
const groq8b = new ChatGroq({
  apiKey: configs.GROQ_API_KEY as string,
  model: "llama-3.1-8b-instant",
  temperature: 0.1,
  maxRetries: 2,
});

// Groq 70B (Pathfinder Brain for Reasoning/Matching)
export const groq70b = new ChatGroq({
  apiKey: configs.GROQ_API_KEY as string,
  model: "llama-3.3-70b-versatile",
  temperature: 0.1,
  maxRetries: 2,
});

export class AssessmentService {
  public static sanitizeJSONString(str: string): string {
    let cleaned = str.trim();
    // 1. Remove markdown fragments if they exist anywhere
    cleaned = cleaned.replace(/```json\s?/g, "");
    cleaned = cleaned.replace(/```\s?/g, "");

    // 2. Extract the actual JSON block by finding matching braces
    const firstBrace = cleaned.indexOf("{");
    if (firstBrace !== -1) {
      let stack = 0;
      let inString = false;
      let escaped = false;
      let lastBrace = -1;

      for (let i = firstBrace; i < cleaned.length; i++) {
        const char = cleaned[i];
        if (escaped) {
          escaped = false;
          continue;
        }
        if (char === "\\") {
          escaped = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === "{") stack++;
          if (char === "}") {
            stack--;
            if (stack === 0) {
              lastBrace = i;
              break;
            }
          }
        }
      }

      if (lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      } else {
        const finalBrace = cleaned.lastIndexOf("}");
        if (finalBrace !== -1) {
          cleaned = cleaned.substring(firstBrace, finalBrace + 1);
        }
      }
    }

    // 3. Final safety: If it still doesn't start with '{', find the first '{' and cut
    const finalStart = cleaned.indexOf("{");
    if (finalStart > 0) {
      cleaned = cleaned.substring(finalStart);
    }
    const finalEnd = cleaned.lastIndexOf("}");
    if (finalEnd !== -1 && finalEnd < cleaned.length - 1) {
      cleaned = cleaned.substring(0, finalEnd + 1);
    }

    // 4. Remove control characters
    cleaned = cleaned.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F]/g, "");

    return cleaned.trim();

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

    const chain = groq70b.pipe(new StringOutputParser());
    let response: string;
    try {
      response = await chain.invoke(
        await prompt.format({ examType, difficulty, testId }),
        { response_format: { type: "json_object" } } as any
      );
    } catch (err) {
      console.warn("Groq 70B failed for generation, falling back to Gemini...");
      const fallbackChain = geminiModel.pipe(new StringOutputParser());
      response = await fallbackChain.invoke(await prompt.format({ examType, difficulty, testId }));
    }

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
        `Assessment generation failed due to invalid AI response. Raw: ${response.substring(0, 100)}...`,
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

    // Store full blueprint in Redis for 30 minutes (was 2 hours)
    await redisConnection.set(
      `test_id:${testId}`,
      JSON.stringify(blueprint),
      "EX",
      1800,
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
    const blueprintData = await redisConnection.get(`test_id:${testId}`);
    if (!blueprintData) throw new Error("Assessment not found or expired.");

    const job = await assessmentQueue.add(
      "assessment-queue",
      {
        testId,
        blueprint: JSON.parse(blueprintData),
        responses,
        studentId,
        audioData: audioData ? { base64: audioData.buffer.toString("base64"), mimetype: audioData.mimetype } : null,
      },
      { jobId: testId, removeOnComplete: { age: 3600 }, removeOnFail: { age: 24 * 3600 } },
    );

    return { status: "submitted", jobId: job.id, testId };
  }

  /**
   * Evaluates a single skill immediately and returns the result.
   */
  static async evaluateSkillSection(
    testId: string,
    skill: string,
    responses: any,
    studentId: number,
    audioData?: { buffer: Buffer; mimetype: string }
  ) {
    const blueprintData = await redisConnection.get(`test_id:${testId}`);
    if (!blueprintData) throw new Error("Assessment not found or expired.");
    const blueprint = JSON.parse(blueprintData);

    const evaluation = await this.evaluateSingleSkill(
      skill,
      blueprint,
      responses,
      audioData ? { base64: audioData.buffer.toString("base64"), mimetype: audioData.mimetype } : undefined
    );

    // Save/Update progress in AssessmentResult table
    let result = await AssessmentResult.findOne({ where: { testId } });
    if (!result) {
      result = await AssessmentResult.create({
        studentId,
        testId,
        examType: blueprint.data?.exam_summary?.type || "IELTS",
        difficulty: blueprint.data?.exam_summary?.difficulty || "Medium",
        evaluation: { score_breakdown: {}, section_notes: {}, learning_mode: {} },
        scoreBreakdown: {},
        overallBand: 0,
      });
    }

    const updatedEval = { ...result.evaluation };
    updatedEval.score_breakdown[skill] = evaluation.score;
    updatedEval.section_notes[skill] = evaluation.feedback;
    updatedEval.learning_mode[skill] = evaluation.learning_mode;

    const updatedBreakdown = { ...result.scoreBreakdown };
    updatedBreakdown[skill] = evaluation.score;

    await result.update({
      evaluation: updatedEval,
      scoreBreakdown: updatedBreakdown
    });

    return {
      status: "success",
      skill,
      score: evaluation.score,
      feedback: evaluation.feedback,
      learning_mode: evaluation.learning_mode
    };
  }

  static async evaluateAssessment(
    testId: string,
    blueprint: any,
    responses: any,
    studentId: number,
    job: Job,
    audioData?: { base64: string; mimetype: string },
  ) {
    const finalEvaluation: any = {
      score_breakdown: {},
      section_notes: {},
      learning_mode: {},
    };

    const skills = ["reading", "listening", "writing", "speaking"];
    
    for (const skill of skills) {
      await job.updateProgress({
        status: "evaluating",
        current_skill: skill,
        testId,
      });

      console.log(`Evaluating skill: ${skill} for test: ${testId}`);
      
      const skillEvaluation = await this.evaluateSingleSkill(
        skill,
        blueprint,
        responses,
        skill === "speaking" ? audioData : undefined
      );

      // Merge scores and notes
      finalEvaluation.score_breakdown[skill] = skillEvaluation.score;
      finalEvaluation.section_notes[skill] = skillEvaluation.feedback;
      finalEvaluation.learning_mode[skill] = skillEvaluation.learning_mode;
    }

    // Calculate Overall Band
    const scores = Object.values(finalEvaluation.score_breakdown) as number[];
    finalEvaluation.overall_band = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);

    // Step 5: Final Synthesis (Gap Analysis + Curriculum)
    await job.updateProgress({
      status: "synthesizing",
      testId,
    });

    console.log(`Synthesizing final learning path for test: ${testId}`);
    const synthesis = await this.synthesizeEvaluation(
      finalEvaluation.score_breakdown,
      finalEvaluation.section_notes,
      blueprint.data?.exam_summary?.type || "IELTS"
    );

    finalEvaluation.competency_gap_analysis = synthesis.competency_gap_analysis;
    finalEvaluation.adaptive_curriculum_map = synthesis.adaptive_curriculum_map;
    finalEvaluation.feedback_report = synthesis.feedback_report;
    finalEvaluation.adaptive_learning_tags = synthesis.adaptive_learning_tags;
    finalEvaluation.learning_mode = synthesis.learning_mode || finalEvaluation.learning_mode;

    // Post-processing (TTS etc.)
    const learningModeListening = finalEvaluation.learning_mode.listening;
    if (learningModeListening && learningModeListening.script) {
      try {
        const audioBase64 = await TTSService.generateAudioBase64(learningModeListening.script);
        if (audioBase64) learningModeListening.audio_base64 = audioBase64;
      } catch (e) {
        console.error("TTS Error in learning mode:", e);
      }
    }

    // Final Storage
    await redisConnection.set(`evaluation:${testId}`, JSON.stringify(finalEvaluation), "EX", 7200);

    try {
      // Parallelize DB operations for speed
      const dbOperations = [
        AssessmentRepository.create({
          studentId,
          testId,
          examType: blueprint.data?.exam_summary?.type || "Unknown",
          difficulty: blueprint.data?.exam_summary?.difficulty || "Unknown",
          evaluation: finalEvaluation,
          scoreBreakdown: finalEvaluation.score_breakdown,
          overallBand: finalEvaluation.overall_band,
        }),
        LearningPathService.generateForStudent(
          studentId,
          finalEvaluation,
          (blueprint.data?.exam_summary?.type || "IELTS") as "IELTS" | "TOEFL"
        )
      ];

      await Promise.all(dbOperations);
    } catch (e) {
      console.error("Storage/LearningPath Error:", e);
    }

    return finalEvaluation;
  }

  private static async evaluateSingleSkill(
    skill: string,
    blueprint: any,
    responses: any,
    audioData?: { base64: string; mimetype: string }
  ) {
    const miniBlueprint = this.stripBlueprintForEvaluation(blueprint);
    const skillBlueprint = miniBlueprint.data?.sections[skill];
    const skillResponse = responses[skill];

    const promptTemplate = PromptTemplate.fromTemplate(`
      Role: Senior {skill} Examiner
      Task: Evaluate the student's {skill} section for an English Proficiency Exam.
      
      Blueprint (Grading Key): {blueprint}
      Student Response: {response}
      
      Instructions:
      1. Assign a score (0-9 for IELTS, 0-30 for TOEFL).
      2. Provide detailed feedback (min 200 chars).
      3. Generate "Learning Mode" content:
         - For Reading: 3 practice questions with answers/explanations.
         - For Listening: A script and 3 questions with answers/explanations.
         - For Writing: A sample answer and explanation.
         - For Speaking: A sample response and tips.

      Return JSON schema:
      {{
        "score": 0.0,
        "feedback": "string",
        "learning_mode": {{ ... }} 
      }}

      CRITICAL: Return ONLY valid JSON. NO preamble, NO markdown blocks (\`\`\`json), and NO extra text.
    `);

    const textPrompt = await promptTemplate.format({
      skill,
      blueprint: JSON.stringify(skillBlueprint),
      response: JSON.stringify(skillResponse),
    });

    const messagesContent: any[] = [{ type: "text", text: textPrompt }];
    const { HumanMessage, SystemMessage } = await import("@langchain/core/messages");
    
    // Select Model based on Skill (Zero-Cost Specialist Stack)
    let selectedModel: any = groq70b; // Reading/Listening use the Brain
    if (skill === "writing") selectedModel = groq8b; // Writing uses the Speed Specialist
    
    let transcriptionText = "";
    if (skill === "speaking" && audioData?.base64) {
      console.log("Transcribing speaking audio with Groq Whisper...");
      try {
        const tempPath = path.join(os.tmpdir(), `speaking_${Date.now()}.m4a`);
        fs.writeFileSync(tempPath, Buffer.from(audioData.base64, "base64"));
        
        const transcription = await groqClient.audio.transcriptions.create({
          file: fs.createReadStream(tempPath),
          model: "whisper-large-v3",
          response_format: "json",
        });
        
        transcriptionText = transcription.text;
        fs.unlinkSync(tempPath); // Cleanup
        console.log("Transcription successful:", transcriptionText.substring(0, 50) + "...");
      } catch (err) {
        console.error("Transcription failed:", err);
        transcriptionText = "[Audio transcription failed, grading based on prompt intent]";
      }
    }

    const chain = selectedModel.pipe(new StringOutputParser());
    
    let responseText: string;
    const systemInstruction = new SystemMessage(
      "You are a strict JSON generator. Return ONLY valid JSON objects. NO markdown, NO preamble, NO explanations."
    );

    const evaluationContent = skill === "speaking" 
      ? `${textPrompt}\n\nSTUDENT SPOKEN TRANSCRIPTION: ${transcriptionText}`
      : textPrompt;

    try {
      const options: any = {};
      options.response_format = { type: "json_object" };
      
      responseText = await chain.invoke(
        [systemInstruction, new HumanMessage({ content: evaluationContent })],
        options
      );
    } catch (err) {
      console.warn(`Groq failed for ${skill}, attempting recovery...`);
      // Since Gemini is 404, we don't fallback to it here, just throw or retry
      throw err;
    }

    let sanitized = this.sanitizeJSONString(responseText);
    try {
      return JSON.parse(sanitized);
    } catch (e) {
      console.warn(`JSON Parse failed for ${skill} on ${selectedModel.model || selectedModel.modelName}. Attempting repair with Groq 70B...`);
      
      // If Groq 8B gave us bad JSON, let's try Groq 70B (The Brain) as a "Repair" model
      if (selectedModel !== groq70b) {
        const repairChain = groq70b.pipe(new StringOutputParser());
        responseText = await repairChain.invoke(
          [systemInstruction, new HumanMessage({ content: evaluationContent })],
          { response_format: { type: "json_object" } } as any
        );
        sanitized = this.sanitizeJSONString(responseText);
        return JSON.parse(sanitized);
      }
      
      const rescued = this.rescueTruncatedJSON(sanitized);
      return JSON.parse(rescued);
    }
  }

  private static async synthesizeEvaluation(
    scores: any,
    notes: any,
    examType: string
  ) {
    const prompt = PromptTemplate.fromTemplate(`
      Role: Lead Curriculum Architect
      Task: Create a final Learning Path based on these skill evaluations.
      
      Scores: {scores}
      Section Notes: {notes}
      Exam: {examType}
      
      Return ONLY a valid JSON object with this EXACT structure:
      {{
        "competency_gap_analysis": {{ "skill_name": "detailed analysis of gaps" }},
        "adaptive_curriculum_map": {{ "week_1": ["topic_to_study"] }},
        "feedback_report": "overall improvement strategy",
        "learning_mode": {{
           "reading": [{{ "question": "", "options": ["", "", "", ""], "correct_answer": 0, "explanation": "" }}],
           "listening": [...],
           "writing": [...],
           "speaking": [...]
        }},
        "adaptive_learning_tags": ["list", "of", "tags"]
      }}
      
      Rules:
      1. Provide 3-5 high-quality practice questions per skill in "learning_mode".
      2. NO MARKDOWN (no \`\`\`json blocks).
      3. NO PREAMBLE or post-text.
      4. Be professional and encouraging.
    `);

    const chain = groq70b.pipe(new StringOutputParser());
    let response: string;
    try {
      response = await chain.invoke(await prompt.format({
        scores: JSON.stringify(scores),
        notes: JSON.stringify(notes),
        examType
      }));
    } catch (err) {
      console.warn("Groq 70B failed for synthesis, falling back to Gemini...");
      const fallbackChain = geminiModel.pipe(new StringOutputParser());
      response = await fallbackChain.invoke(await prompt.format({
        scores: JSON.stringify(scores),
        notes: JSON.stringify(notes),
        examType
      }));
    }

    const sanitized = this.sanitizeJSONString(response);
    try {
      return JSON.parse(sanitized);
    } catch (e) {
      console.warn("JSON Parse failed in synthesis, attempting rescue...");
      try {
        const rescued = this.rescueTruncatedJSON(sanitized);
        return JSON.parse(rescued);
      } catch (rescueError) {
        console.error("Final synthesis JSON parse failure:", response);
        throw e;
      }
    }
  }

  static async getAssessmentResult(testId: string) {
    // 1. Try Cache
    const storedResult = await redisConnection.get(`evaluation:${testId}`);
    if (storedResult) {
      return { status: "success", data: JSON.parse(storedResult) };
    }

    // 2. Try Database (New Safety Fallback)
    const dbResult = await AssessmentRepository.findByTestId(testId);
    if (dbResult && dbResult.evaluation && Object.keys(dbResult.evaluation.score_breakdown || {}).length > 0) {
      return { status: "success", data: dbResult.evaluation };
    }

    // 3. Try Active Job
    const job = await assessmentQueue.getJob(testId);
    if (!job) {
      // If no job and no DB result, it might be truly lost
      return { status: "not_found", message: "Assessment not found or expired" };
    }

    const state = await job.getState();
    const progress = await job.progress;

    if (state === "completed") {
      // If completed but not in DB yet or empty, keep it active for the UI
      if (!job.returnvalue || Object.keys(job.returnvalue.score_breakdown || {}).length === 0) {
        return { 
          status: "active", 
          progress: progress || { status: "synthesizing", testId } 
        };
      }
      return { status: "success", data: job.returnvalue };
    }

    if (state === "failed") {
      return { status: "failed", error: job.failedReason || "Assessment evaluation failed" };
    }

    return { 
      status: state, // 'active' or 'waiting'
      progress: progress // This will contain { status: "evaluating", current_skill: "reading", ... }
    };
  }

  static async getStudentProgress(studentId: number, examType?: string) {
    return await AssessmentRepository.getStudentProgress(studentId, examType);
  }

  static async resetAssessment(studentId: number) {
    // 1. Delete all assessment results
    await AssessmentRepository.deleteByStudentId(studentId);
    
    // 2. Clear learning path (upsert handles it, but if we want to DELETE it completely:)
    const { LearningPath } = await import("../models/LearningPath.js");
    const { LearningPathProgress } = await import("../models/LearningPathProgress.js");
    
    await LearningPathProgress.destroy({ where: { studentId } });
    await LearningPath.destroy({ where: { studentId } });
  }
}
