import { GoogleGenerativeAI } from "@google/generative-ai";
import configs from "../config/configs.js";

const genAI = new GoogleGenerativeAI(configs.GEMINI_API_KEY!);
const geminiModelName = configs.GEMINI_MODEL || "gemini-2.5-flash";

export class AIService {
  static async extractOnboardingData(
    fileBuffer: Buffer,
    mimeType: string,
    role: string,
  ) {
    // Keep using Gemini for Vision tasks (Extracting data from files/images)
    const model = genAI.getGenerativeModel({
      model: geminiModelName,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt =
      role === "student"
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
          mimeType: mimeType,
        },
      },
      prompt,
    ]);

    return JSON.parse(result.response.text());
  }

  static async verifyIdentity(idCardBuffer: Buffer, selfieBuffer: Buffer) {
    const model = genAI.getGenerativeModel({
      model: geminiModelName,
      generationConfig: {
        responseMimeType: "application/json",
      },
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
      {
        inlineData: {
          data: idCardBuffer.toString("base64"),
          mimeType: "image/jpeg",
        },
      },
      {
        inlineData: {
          data: selfieBuffer.toString("base64"),
          mimeType: "image/jpeg",
        },
      },
    ]);

    return JSON.parse(response.response.text());
  }

  /**
   * AI-powered scholarship ranking using Gemini.
   */
  static async rankScholarships(studentData: any, scholarships: any[]) {
    if (!scholarships.length) return [];

    // TOKEN OPTIMIZATION: Prune student profile down to essential matching fields
    const prunedStudent = {
      degree_seeking: studentData.degreeSeeking,
      major: studentData.fieldOfStudy || studentData.fieldOfStudyInput,
      gpa: studentData.calculatedGpa || studentData.gpa,
      academic_status: studentData.academicStatus,
      preferred_countries: studentData.preferredCountries,
      research_interests: studentData.researchArea,
      experience: studentData.workExperience?.slice(0, 500), // Truncate long work exp
      funding_needs: studentData.preferredFundingType,
    };

    // TOKEN OPTIMIZATION: Prune scholarships to essential fields and truncate descriptions
    const prunedScholarships = scholarships.map((s: any) => ({
      id: s.id,
      title: s.title,
      description: s.description?.slice(0, 1000), // Larger window for better matching
      requirements: s.requirements?.slice(0, 800),
      country: s.country,
      degree_levels: s.degreeLevels || s.degree_levels,
    }));

    const prompt = `
            You are an expert academic advisor. Compare the following student profile with the list of scholarships.
            
            Student Profile:
            ${JSON.stringify(prunedStudent, null, 2)}
            
            Scholarships:
            ${JSON.stringify(prunedScholarships, null, 2)}
            
            Task:
            1. Evaluate each scholarship independently based on how well it matches the student's background, interests, and goals.
            2. Assign a 'match_score' (0-100) and provide a detailed 'match_reason' (max 300 chars). 
               - Be CRITICAL but FAIR. 
               - 100: Perfect match (same major/field, exact degree level).
               - 80: Strong match; good field overlap or a high-quality "Any Major" scholarship for the correct degree level.
               - 50: Partial match; correct degree level but field/country is only tangentially related.
               - 20: Weak match; significant degree or field mismatch.
               - IMPORTANT: If a scholarship is open to "ALL FIELDS" or "ANY MAJOR", do NOT penalize it for lacking a specific major name match. Give it a high score if other criteria fit.
            3. Return the results as a JSON object with a 'matches' key containing an array of ALL processed scholarship IDs. Preserve the exact numerical format of the IDs.
            
            IMPORTANT: Return ONLY a valid JSON object. Do not include markdown formatting or explanations.
            Format:
            {
              "matches": [
                { "id": number, "match_score": number, "match_reason": "String explaining match" }
              ]
            }
        `;

    try {
      const model = genAI.getGenerativeModel({
        model: geminiModelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.0,
        },
      });

      const response = await model.generateContent([prompt]);
      const responseText = response.response.text() || '{"matches": []}';
      console.log(
        `[AIService] Gemini Response for ${scholarships.length} scholarships:`,
        responseText,
      );
      
      const parsed = JSON.parse(responseText);

      // Extract the array from the normalized Gemini response
      if (parsed.matches && Array.isArray(parsed.matches)) {
        return parsed.matches;
      }

      if (Array.isArray(parsed)) {
        return parsed;
      }

      // Final fallback: try to find any array in the object
      const firstArray = Object.values(parsed).find((v) => Array.isArray(v));
      return Array.isArray(firstArray) ? (firstArray as any[]) : [];
    } catch (error: any) {
      console.error("[AIService] Error ranking scholarships with Gemini:", error);
      throw error;
    }
  }

  /**
   * Evaluates a speaking response using Gemini's multimodal capabilities.
   */
  static async evaluateSpeaking(
    prompt: string,
    audioBase64: string,
    mimeType: string,
    examType: "IELTS" | "TOEFL" = "IELTS",
  ) {
    const model = genAI.getGenerativeModel({
      model: geminiModelName,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const scoringRange = examType === "IELTS" ? "0.0 to 9.0" : "0 to 30";

    const aiPrompt = `
            Role: Senior ${examType} Speaking Examiner.
            Task: Evaluate the student's speaking response to the following prompt.
            
            Speaking Prompt: "${prompt}"
            Exam Type: ${examType}
            
            Evaluation Criteria:
            1. Pronunciation: Clarity, intonation, and rhythm.
            2. Fluency: Speed, hesitation, and flow.
            3. Coherence: Logic, structure, and relevance.
            4. Vocabulary & Grammar: Accuracy and range.
            
            Scoring: Provide a score from ${scoringRange} based on the ${examType} rubric.
            
            Return JSON in this schema:
            {
              "score": number,
              "pronunciation": "string",
              "fluency": "string",
              "coherence": "string",
              "overall_feedback": "detailed summary string"
            }
        `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: audioBase64,
          mimeType: mimeType,
        },
      },
      aiPrompt,
    ]);

    return JSON.parse(result.response.text());
  }
}
