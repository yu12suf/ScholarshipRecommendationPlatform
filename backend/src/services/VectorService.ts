import { Student } from "../models/Student.js";
import { GeminiIngestionService } from "./GeminiIngestionService.js";
import * as crypto from "crypto";

export class VectorService {
    /**
     * Generates or refreshes the student's embedding if their profile has changed.
     * Uses MD5 hashing to detect changes in the context text.
     */
    static async generateStudentEmbedding(student: Student): Promise<void> {
        const studentContext = `
          A ${student.academicStatus || "Unknown"} student interested in ${student.studyPreferences || "various fields"}. 
          Academic background: ${student.academicHistory || "Not specified"}. 
          Skills and expertise: ${student.extractedData || "Not specified"}. 
          Professional experience: ${student.workExperience || "Not specified"}. 
          Goal: Study in ${student.countryInterest || "any country"}.
        `.replace(/\s+/g, ' ').trim();

        const currentHash = crypto.createHash("md5").update(studentContext).digest("hex");

        // Refresh if no embedding exists or if profile text has changed
        if (!student.embedding || student.profileHash !== currentHash) {
            console.log(`[VectorService] Refreshing embedding for student ${student.id}...`);
            const vector = await GeminiIngestionService.generateEmbedding(studentContext);
            const vectorString = `[${vector.join(',')}]`;

            await student.update({
                embedding: vectorString,
                profileHash: currentHash
            });
        }
    }

    /**
     * Generates an embedding for a scholarship.
     * Builds the context string internally for consistency.
     */
    static async generateScholarshipEmbedding(scholarshipData: any): Promise<number[]> {
        const context = `
          ${scholarshipData.title} for ${(scholarshipData.degreeLevels || []).join(", ")} students in ${scholarshipData.country || "Unknown"}. 
          Type: ${scholarshipData.fundType || "Unknown"}. 
          Opportunity details: ${scholarshipData.description}. 
          Candidate requirements: ${scholarshipData.requirements || "Not specified"}.
        `.replace(/\s+/g, ' ').trim();

        return GeminiIngestionService.generateEmbedding(context);
    }
}
