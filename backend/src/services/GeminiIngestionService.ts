import { GoogleGenerativeAI ,TaskType} from "@google/generative-ai";
import configs from "../config/configs.js";
import { ExtractedScholarshipData } from "../types/scholarshipTypes.js";

const genAI = new GoogleGenerativeAI(configs.GEMINI_API_KEY!);

export class GeminiIngestionService {

    /**
     * Extracts structured scholarship data from raw text using Gemini 1.5 Flash (002).
     * Retries on 429 Too Many Requests with exponential backoff.
     */
    static async extractScholarshipData(text: string): Promise<ExtractedScholarshipData> {
        // Use gemini-1.5-flash-002 for cost efficiency and speed
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
            You are an expert scholarship data extractor.
            Analyze the following text from a scholarship webpage and extract the details.
            
            Return JSON with these fields:
            - title (string): The name of the scholarship.
            - description (string): A brief summary of the scholarship (max 500 chars).
            - amount (string): The financial value (e.g., "$5000", "Full Tuition", "Varies"). If not found, use "Unknown".
            - deadline (string | null): The application deadline in ISO 8601 format (YYYY-MM-DD) if found, otherwise null. Search for keywords like "deadline", "apply by", "closing date".
            - fundType (string | null): The type of funding provided. Options: "Full Funding", "Partial Funding", "Stipend", "Tuition Only", "Other". If not clear, use "Other".
            - degreeLevels (string[]): The degree levels the scholarship is for. Options: "Bachelor", "Master", "PhD", "Diploma", "Certificate", "Other". If not clear, use ["Other"].
            - requirements (string | null): The detailed eligibility criteria or requirements.
            - intakeSeason (string | null): The expected start season or intake (e.g., "Fall 2026", "Spring 2026").
            - country (string | null): The country or region where the scholarship is applicable or where the study takes place.
            Text:
            ${text.substring(0, 10000)} -- Truncated to avoid token limits if necessary
        `;

        return this.retryWithBackoff(async () => {
            const result = await model.generateContent(prompt);
            const response = result.response;
            return JSON.parse(response.text()) as ExtractedScholarshipData;
        }, "Extract Data");
    }

    /**
     * Generates a text embedding vector (768 dimensions) using text-embedding-004.
     * Retries on 429 Too Many Requests.
     */
    static async generateEmbedding(text: string): Promise<number[]> {
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await model.embedContent({
            content: { 
                role: "user", 
                parts: [{ text: text }] 
            },
            taskType: TaskType.SEMANTIC_SIMILARITY,
        }); 

        return  result.embedding.values;

       
    }

    /**
     * Utility to retry an async operation with exponential backoff on 429 errors.
     */
    private static async retryWithBackoff<T>(operation: () => Promise<T>, operationName: string, maxRetries = 3): Promise<T> {
        let attempt = 0;

        while (attempt <= maxRetries) {
            try {
                return await operation();
            } catch (error: any) {
                if (error.status === 429 || (error.message && error.message.includes("429"))) {
                    attempt++;
                    if (attempt > maxRetries) {
                        console.error(`[Gemini] ${operationName} failed after ${maxRetries} retries due to rate limiting.`);
                        throw error;
                    }

                    // Extract retry delay from error if available, or use default exponential backoff
                    // Google's library might not expose the header directly in the error object comfortably,
                    // so we use a safe default: (2^attempt * 1000ms) + jitter
                    let delayMs = (Math.pow(2, attempt) * 1000) + (Math.random() * 1000);

                    // If error has a specific retry delay (rare in simple error objects), use it
                    // NOTE: implementation depends on exact error structure from library

                    console.warn(`[Gemini] 429 Too Many Requests during ${operationName}. Retrying in ${Math.round(delayMs)}ms (Attempt ${attempt}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                } else {
                    // Non-retriable error
                    console.error(`[Gemini] Error during ${operationName}:`, error);
                    throw error;
                }
            }
        }
        throw new Error("Unreachable");
    }
}
