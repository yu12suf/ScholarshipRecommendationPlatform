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
            Level: ${student.academicStatus || ""}
            Interests: ${student.studyPreferences || ""}
            History: ${student.academicHistory || ""}
            Skills: ${student.extractedData || ""}
            Experience: ${student.workExperience || ""}
            Goal_Country: ${student.countryInterest || ""}
        `.replace(/\s+/g, ' ').trim();

        const currentHash = crypto.createHash("md5").update(studentContext).digest("hex");

        if (!student.embedding || student.profileHash !== currentHash) {
            console.log(`[VectorService] Refreshing dense embedding for student ${student.id}...`);
            
            // TASK_TYPE: RETRIEVAL_QUERY (Standard for Google Gemini Embeddings)
            const vector = await GeminiIngestionService.generateEmbedding(
                studentContext,
            
            );
            
            const vectorString = `[${vector.join(',')}]`;

            await student.update({
                embedding: vectorString,
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
            Title: ${scholarshipData.title}
            Level: ${(scholarshipData.degree_levels || scholarshipData.degreeLevels || []).join(", ")}
            Location: ${scholarshipData.country || ""}
            Type: ${scholarshipData.fundType || ""}
            Description: ${description || ""}
            Requirements: ${requirements || ""}
        `.replace(/\s+/g, ' ').trim();

        // TASK_TYPE: RETRIEVAL_DOCUMENT
        return GeminiIngestionService.generateEmbedding(
            context
        );
    }
}
