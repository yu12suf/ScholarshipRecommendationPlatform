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
            Nationality: ${student.nationality || ""}
            Residence: ${student.countryOfResidence || ""}
            Level: ${student.academicStatus || ""}
            Seeking: ${student.degreeSeeking || ""}
            PreferredLevels: ${student.preferredDegreeLevel || ""}
            StudyMode: ${student.studyMode || ""}
            Interests: ${student.studyPreferences || student.fieldOfStudy || ""}
            Research: ${student.researchArea || ""} ${student.proposedResearchTopic || ""}
            History: ${student.academicHistory || ""}
            Experience: ${student.workExperience || ""}
            Goal_Country: ${student.countryInterest || student.preferredCountries || ""}
        `.replace(/\s+/g, ' ').trim();

        const currentHash = crypto.createHash("md5").update(studentContext).digest("hex");

        if (!student.embedding || student.profileHash !== currentHash) {
            console.log(`[VectorService] Refreshing dense embedding for student ${student.id}...`);
            
            // TASK_TYPE: RETRIEVAL_QUERY (Standard for Google Gemini Embeddings)
            const vector = await GeminiIngestionService.generateEmbedding(
                studentContext,
            
            );
            
            // PostgreSQL vector column expects JSON string like "[0.1, 0.2, ...]"
            await student.update({
                embedding: JSON.stringify(vector),
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

        // TASK_TYPE: RETRIEVAL_DOCUMENT - returns array, caller stringifies if needed
        return GeminiIngestionService.generateEmbedding(
            context
        );
    }
}
