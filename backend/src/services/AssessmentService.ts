import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { v4 as uuidv4 } from "uuid";
import configs from "../config/configs.js";
import { redisConnection, assessmentQueue } from "../config/redis.js";
import { AssessmentResult } from "../models/AssessmentResult.js";
import { AssessmentRepository } from "../repositories/AssessmentRepository.js";

const model = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    apiKey: configs.GROQ_API_KEY as string,
    temperature: 0.2,
    maxTokens: 4096,
});

export class AssessmentService {
    private static sanitizeJson(jsonString: string): string {
        try {
            // Remove NULL characters and other extreme control characters
            let cleaned = jsonString.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/g, "");

            // Escape literal newlines, carriage returns, and tabs inside double quotes
            cleaned = cleaned.replace(/"((?:[^"\\\\]|\\\\.)*)"/g, (match, p1) => {
                return '"' + p1
                    .replace(/\n/g, '\\n')
                    .replace(/\r/g, '\\r')
                    .replace(/\t/g, '\\t')
                    + '"';
            });
            return cleaned;
        } catch (e) {
            console.error("Sanitization error:", e);
            return jsonString;
        }
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
        `);

        const chain = prompt.pipe(model).pipe(new StringOutputParser());
        const response = await chain.invoke({ examType, difficulty, testId });

        // Ensure response is valid JSON
        let blueprint;
        try {
            console.log("--- GENERATE EXAM AI RESPONSE ---");
            console.log(response);
            
            // Some models might wrap JSON in markdown blocks
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            const rawJson = jsonMatch ? jsonMatch[0] : response;
            const sanitized = this.sanitizeJson(rawJson);
            
            blueprint = JSON.parse(sanitized);
        } catch (error: any) {
            console.error("Failed to parse AI response as JSON:", response);
            console.error(error);
            throw new Error(`Assessment generation failed: ${error.message}`);
        }

        // Force the testId to match what we generated to avoid AI hallucinations
        if (blueprint.data) {
            blueprint.data.test_id = testId;
        }

        // Store full blueprint in Redis for 2 hours
        await redisConnection.set(`test_id:${testId}`, JSON.stringify(blueprint), "EX", 7200);
        // Sanitize for frontend
        const sanitizedData = JSON.parse(JSON.stringify(blueprint));
        sanitizedData.data.sections.reading.questions.forEach((q: any) => delete q.correct_answer);
        sanitizedData.data.sections.listening.questions.forEach((q: any) => delete q.correct_answer);

        return sanitizedData;
    }

    static async submitAssessment(testId: string, responses: any, studentId: number, audioBuffer?: Buffer) {
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
            audioBuffer: audioBuffer ? audioBuffer.toString("base64") : null
        }, {
            jobId: testId,
            removeOnComplete: false,
            removeOnFail: { age: 24 * 3600 }
        });

        return { status: "submitted", jobId: job.id, testId };
    }

    static async evaluateAssessment(testId: string, blueprint: any, responses: any, studentId: number, audioBase64?: string) {
        // ... (existing code omitted for brevity but actually kept in full
        const prompt = PromptTemplate.fromTemplate(`
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
            
            Return JSON in the following schema:
            {{
              "evaluation": {{
                "overall_band": 0.0,
                "subscores": {{ "reading": 0, "listening": 0, "writing": 0, "speaking": 0 }},
                "feedback_report": "string",
                "adaptive_learning_tags": []
              }}
            }}
        `);

        const chain = prompt.pipe(model).pipe(new StringOutputParser());
        const response = await chain.invoke({
            blueprint: JSON.stringify(blueprint),
            responses: JSON.stringify(responses),
            hasAudio: audioBase64 ? "Yes" : "No"
        });

        let evaluation;
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const rawJson = jsonMatch ? jsonMatch[0] : response;
        const sanitized = this.sanitizeJson(rawJson);
        try {
            console.log("--- EVALUATE ASSESSMENT AI RESPONSE ---");
            console.log(response);

            // Attempt to parse sanitized JSON
            evaluation = JSON.parse(sanitized);
            console.log("✅ PARSED EVALUATION SUCCESS");
        } catch (error: any) {
            console.error("❌ PARSE EVALUATION ERROR:", error.message);
            
            // Helpful debugging for position-based errors
            if (error.message.includes("position")) {
                const posStr = error.message.match(/position (\d+)/)?.[1];
                if (posStr) {
                    const pos = parseInt(posStr);
                    console.log("Error at or near:", sanitized.substring(Math.max(0, pos - 20), Math.min(sanitized.length, pos + 20)));
                }
            }
            
            console.log("Sanitized JSON was:", sanitized);
            throw new Error(`Assessment evaluation failed: ${error.message}`);
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
        } catch (dbError: any) {
            console.error("❌ Failed to store assessment result in DB:", dbError.message);
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
