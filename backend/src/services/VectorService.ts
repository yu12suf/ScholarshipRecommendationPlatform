import { Student } from "../models/Student.js";
import { GeminiIngestionService } from "./GeminiIngestionService.js";
import * as crypto from "crypto";
import { TextCleaner } from "../utils/textcleaner.js";


export class VectorService {
    /**
     * Refined Student Context: Focus on dense keywords.
     */
    static async generateStudentEmbedding(student: Student): Promise<void> {
        // We use a structured list. This makes the "meaning" denser.
        const studentContext = `
            Location: ${student.countryOfResidence || ""}
            Target_Location: ${student.countryInterest || student.preferredCountries || ""}
            Level: ${student.academicStatus || student.preferredDegreeLevel || ""}
            FieldOfStudy: ${student.studyPreferences || student.fieldOfStudy || ""}
            Experience: ${student.workExperience || ""}
            Requirements: ${student.academicHistory || ""}
        `.replace(/\s+/g, ' ').trim();

        const currentHash = crypto.createHash("md5").update(studentContext).digest("hex");

        if (!student.embedding || student.profileHash !== currentHash) {
            console.log(`[VectorService] Student Context for AI: "${studentContext}"`);
            console.log(`[VectorService] Refreshing dense embedding for student ${student.id}...`);
            
            // TASK_TYPE: RETRIEVAL_QUERY (Standard for Google Gemini Embeddings)
            const vector = await GeminiIngestionService.generateEmbedding(
                studentContext,
            
            );
            
            await student.update({
                embedding: vector,
                profileHash: currentHash
            });
        }
    }

    /**
     * Refined Scholarship Context: Mirrors the student structure.
     */
    static async generateScholarshipEmbedding(scholarshipData: any): Promise<number[]> {
           const description = TextCleaner.prepare(scholarshipData.description);
    const requirements = TextCleaner.prepare(scholarshipData.requirements);
        const context = `
            Location: ${scholarshipData.country || ""}
            Target_Location: ${scholarshipData.country || ""}
            Level: ${(scholarshipData.degree_levels || scholarshipData.degreeLevels || []).join(", ")}
            FieldOfStudy: ${description || ""}
            Requirements: ${requirements || ""}
        `.replace(/\s+/g, ' ').trim();

        // TASK_TYPE: RETRIEVAL_DOCUMENT
        return GeminiIngestionService.generateEmbedding(
            context
        );
    }
}
