import { GoogleGenerativeAI } from "@google/generative-ai";
import configs from "../config/configs.js";

const genAI = new GoogleGenerativeAI(configs.GEMINI_API_KEY!);
export class AIService {
    static async extractOnboardingData(fileBuffer: Buffer, mimeType: string, role: string) {
        // IMPROVEMENT: Use 'gemini-1.5-flash' or 'gemini-2.0-flash' for even better speed
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            // NEW: Enforce JSON output at the configuration level
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = role === 'student'
            ? `Extract academic history, skills, GPA, work experience, high school information, and academic status. 
               Instructions:
               1. Academic history: array of {institution, degree, year}.
               2. GPA: Convert Ethiopian 5.0 scale or 100% scale to 4.0 scale.
               3. Skills: array of strings.
               4. Work Experience: Extract professional experience (especially for Master's/PhD students). Return as a string or null.
               5. High School: If the document is from a high school student, extract the high school name and GPA.
               6. Academic Status: Infer current academic level (highschool, degree, or masters).
               Return as JSON: { "academic_history": [], "skills": [], "gpa": number, "work_experience": string | null, "high_school": string | null, "academic_status": string | null }`
            : `Extract bio, expertise, and experience. 
               Instructions:
               1. Bio: Short professional summary.
               2. Areas of expertise: array of strings.
               3. Years of experience: numeric value only.
               Return as JSON: { "bio": "", "areas_of_expertise": [], "years_of_experience": number }`;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: fileBuffer.toString("base64"),
                    mimeType: mimeType
                }
            },
            prompt,
        ]);

        // With responseMimeType: "application/json", response.text() is guaranteed to be valid JSON
        return JSON.parse(result.response.text());
    }

    static async verifyIdentity(idCardBuffer: Buffer, selfieBuffer: Buffer) {
        // IMPROVEMENT: 2.0-flash is excellent for "spatial reasoning" (comparing faces)
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
            Task: Compare the person in the selfie (Image B) to the ID card (Image A).
            1. Provide a confidence_score between 0 and 1 (1 is a perfect match).
            2. Extract full_name and dob (format: YYYY-MM-DD) from the ID card.
            3. If the faces do not match, set confidence_score to low.
            Return JSON: { "confidence_score": number, "full_name": string, "dob": string }
        `;

        const response = await model.generateContent([
            prompt,
            { inlineData: { data: idCardBuffer.toString("base64"), mimeType: "image/jpeg" } },
            { inlineData: { data: selfieBuffer.toString("base64"), mimeType: "image/jpeg" } }
        ]);

        return JSON.parse(response.response.text());
    }
}