import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { v4 as uuidv4 } from "uuid";
import configs from "../config/configs.js";
import { redisConnection, assessmentQueue } from "../config/redis.js";
import { AssessmentResult } from "../models/AssessmentResult.js"; // Keeping for type if needed, or remove if unused
import { AssessmentRepository } from "../repositories/AssessmentRepository.js";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: configs.GEMINI_API_KEY as string,
});

export class AssessmentService {
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
            // Some models might wrap JSON in markdown blocks
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            blueprint = JSON.parse(jsonMatch ? jsonMatch[0] : response);
        } catch (error) {
            console.error("Failed to parse AI response as JSON:", response);
            throw new Error("Assessment generation failed due to invalid AI response.");
        }

        // Force the testId to match what we generated to avoid AI hallucinations
        if (blueprint.data) {
            blueprint.data.test_id = testId;
        }

        // Store full blueprint in Redis for 2 hours
        await redisConnection.set(`test_id:${testId}`, JSON.stringify(blueprint), "EX", 7200);
        // Sanitize for frontend
        const sanitized = JSON.parse(JSON.stringify(blueprint));
        sanitized.data.sections.reading.questions.forEach((q: any) => delete q.correct_answer);
        sanitized.data.sections.listening.questions.forEach((q: any) => delete q.correct_answer);

        return sanitized;
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
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : response);
            console.log(evaluation);
        } catch (error) {
            console.log(error);
            throw new Error("Assessment evaluation failed due to invalid AI response.");
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
