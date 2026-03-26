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
    model: "gemini-2.5-flash",
    apiKey: configs.GEMINI_API_KEY as string,
});

export class AssessmentService {
    public static sanitizeJSONString(str: string): string {
        let isInsideString = false;
        let isEscaped = false;
        let result = "";
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            
            if (isInsideString) {
                if (char === '"' && !isEscaped) {
                    isInsideString = false;
                    result += char; 
                } else if (char === '\\') {
                    isEscaped = !isEscaped;
                    result += char;
                } else {
                    isEscaped = false;
                    if (char === '\n') {
                        result += '\\n';
                    } else if (char === '\r') {
                        result += '\\r';
                    } else if (char === '\t') {
                        result += '\\t';
                    } else if (char && char.charCodeAt(0) < 32) {
                        // ignore other control characters to be safe
                    } else {
                        result += char;
                    }
                }
            } else {
                if (char === '"') {
                    isInsideString = true;
                }
                result += char;
            }
        }
        // Remove trailing commas to prevent parsing errors
        return result.replace(/,\s*([\]}])/g, '$1');
    }

    static async generateExam(examType: "IELTS" | "TOEFL", difficulty: "Easy" | "Medium" | "Hard") {
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
                  "reading": {{ "passage": "string", "questions": [{{ "id": 1, "text": "string", "options": [], "correct_answer": "string" }}] }},
                  "listening": {{ "script": "string", "questions": [{{ "id": 1, "text": "string", "options": [], "correct_answer": "string" }}] }},
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
            console.error("Sanitized JSON:", AssessmentService.sanitizeJSONString(rawJson));
            throw new Error("Assessment generation failed due to invalid AI response.");
        }

        // Force the testId to match what we generated to avoid AI hallucinations
        if (blueprint.data) {
            blueprint.data.test_id = testId;
        }

        // Generate audio for listening section
        const listeningScript = blueprint.data?.sections?.listening?.script;
        if (listeningScript) {
            try {
                const audioBase64 = await TTSService.generateAudioBase64(listeningScript);
                if (audioBase64) {
                    blueprint.data.sections.listening.audio_base64 = audioBase64;
                }
            } catch (ttsErr) {
                console.error("Failed to generate audio for listening script:", ttsErr);
            }
        }

        // Store full blueprint in Redis for 2 hours
        await redisConnection.set(`test_id:${testId}`, JSON.stringify(blueprint), "EX", 7200);
        // Sanitize for frontend
        const sanitized = JSON.parse(JSON.stringify(blueprint));
        sanitized.data.sections.reading.questions.forEach((q: any) => delete q.correct_answer);
        sanitized.data.sections.listening.questions.forEach((q: any) => delete q.correct_answer);

        return sanitized;
    }

    static async submitAssessment(testId: string, responses: any, studentId: number, audioData?: { buffer: Buffer; mimetype: string }) {
        // Fetch blueprint from Redis
        const blueprintData = await redisConnection.get(`test_id:${testId}`);
        if (!blueprintData) {
            throw new Error("Assessment not found or expired.");
        }

        const job = await assessmentQueue.add("assessment-queue", {
            testId,
            blueprint: JSON.parse(blueprintData),
            responses,
            studentId,
            audioData: audioData ? {
                base64: audioData.buffer.toString("base64"),
                mimetype: audioData.mimetype
            } : null
        }, {
            jobId: testId,
            removeOnComplete: false,
            removeOnFail: { age: 24 * 3600 }
        });

        return { status: "submitted", jobId: job.id, testId };
    }

    static async evaluateAssessment(testId: string, blueprint: any, responses: any, studentId: number, audioData?: { base64: string; mimetype: string }) {
        // ... (existing code omitted for brevity but actually kept in full
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
               - For EACH skill (Reading, Listening, Writing, Speaking), generate a highly detailed "Actionable Study Note" (minimum 1000 characters each).
               - The note MUST include:
                 a) A clear explanation of the weakness identified.
                 b) Specific examples of where the student made mistakes in THIS assessment.
                 c) Step-by-step strategies to improve.
                 d) Recommended exercise types.
            4. LEARNING MODE PRACTICE:
               - For EACH skill, generate 3-5 original practice questions based on the identified weaknesses.
               - Each question must include the text/prompt, options (if applicable), the correct answer, and a clear explanation of WHY it is correct.
            
            Return JSON in the following schema:
            {{
              "evaluation": {{
                "overall_band": 0.0,
                "subscores": {{ "reading": 0, "listening": 0, "writing": 0, "speaking": 0 }},
                "feedback_report": "Overall feedback summary",
                "section_notes": {{ 
                  "reading": "Detailed 1000+ char note with examples for reading", 
                  "listening": "Detailed 1000+ char note with examples for listening", 
                  "writing": "Detailed 1000+ char note with examples for writing", 
                  "speaking": "Detailed 1000+ char note with examples for speaking" 
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
            hasAudio: audioData ? "Yes" : "No"
        });

        const messagesContent: any[] = [{ type: "text", text: textPrompt }];
        if (audioData && audioData.base64) {
            messagesContent.push({
                type: "media",
                mimeType: audioData.mimetype || "audio/mp3",
                data: audioData.base64
            });
        }

        // We use HumanMessage directly for multimodal structure instead of the plain String Output
        const { HumanMessage } = await import("@langchain/core/messages");
        const chain = model.pipe(new StringOutputParser());
        const response = await chain.invoke([new HumanMessage({ content: messagesContent })]);

        let evaluation;
        let rawJson = "";
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            rawJson = jsonMatch ? jsonMatch[0] : response;
            evaluation = JSON.parse(AssessmentService.sanitizeJSONString(rawJson));
            console.log(evaluation);
        } catch (error) {
            console.error("Failed to parse evaluation AI response:", response);
            console.error("Sanitized JSON that failed parsing:", AssessmentService.sanitizeJSONString(rawJson));
            console.error(error);
            throw new Error("Assessment evaluation failed due to invalid AI response.");
        }

        // Generate audio for learning mode listening questions
        if (evaluation.evaluation?.learning_mode?.listening) {
            for (const q of evaluation.evaluation.learning_mode.listening) {
                if (q.question) {
                    try {
                        const audioBase64 = await TTSService.generateAudioBase64(q.question);
                        if (audioBase64) {
                            q.audio_base64 = audioBase64;
                        }
                    } catch (ttsErr) {
                        console.error("Failed to generate audio for learning mode question:", ttsErr);
                    }
                }
            }
        }

        // Store result in Redis
        await redisConnection.set(`evaluation:${testId}`, JSON.stringify(evaluation), "EX", 7200);

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
                overallBand
            });

            // Trigger Learning Path Generation
            await LearningPathService.generateForStudent(studentId, evaluation);
        } catch (dbError: any) {
            console.error("❌ Failed to store assessment result or generate learning path:", dbError.message);
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
            return { status: "not_found", message: "Assessment not found or expired" };
        }

        const state = await job.getState(); // 'completed', 'failed', 'active', 'waiting'

        if (state === "completed") {
            return {
                status: "success",
                // This is where BullMQ stores the result of the worker's return statement
                data: job.returnvalue
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
