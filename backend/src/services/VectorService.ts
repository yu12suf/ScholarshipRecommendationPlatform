import { Student } from "../models/Student.js";
import { Counselor } from "../models/Counselor.js";
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

    /**
     * Symmetric Context for Counselor Matching: Offering
     */
    static async generateCounselorEmbedding(counselor: Counselor): Promise<void> {
        const counselorContext = `
            Focus: ${counselor.areasOfExpertise || ""}
            Geography: ${[counselor.specializedCountries, counselor.studyCountry, counselor.countryOfResidence].filter(Boolean).join(", ")}
            Academic_Level: ${counselor.highestEducationLevel || ""}
            Field: ${counselor.fieldsOfStudy || ""}
            Expertise_Details: ${counselor.bio || ""} ${counselor.yearsOfExperience ? `Years experience: ${counselor.yearsOfExperience}` : ""}
        `.replace(/\s+/g, ' ').trim();

        const currentHash = crypto.createHash("md5").update(counselorContext).digest("hex");

        if (!counselor.embedding || counselor.profileHash !== currentHash) {
            console.log(`[VectorService] Counselor Context for AI: "${counselorContext}"`);
            const vector = await GeminiIngestionService.generateEmbedding(counselorContext);
            
            await counselor.update({
                embedding: vector,
                profileHash: currentHash
            });
        }
    }

    /**
     * Symmetric Context for Counselor Matching: Request
     */
    static async generateStudentForCounselorEmbedding(student: Student): Promise<string> {
        const studentContext = `
            Focus: ${student.researchArea || student.studyPreferences || ""}
            Geography: ${[student.countryInterest, student.preferredCountries].filter(Boolean).join(", ")}
            Academic_Level: ${student.preferredDegreeLevel || ""}
            Field: ${student.fieldOfStudy || ""}
            Background_Details: ${student.workExperience || ""} ${student.academicHistory || ""}
        `.replace(/\s+/g, ' ').trim();

        const currentHash = crypto.createHash("md5").update(studentContext).digest("hex");

        if (!student.counselorEmbedding || student.counselorProfileHash !== currentHash) {
            console.log(`[VectorService] Student Context for Counselor Matching: "${studentContext}"`);
            const vector = await GeminiIngestionService.generateEmbedding(studentContext);
            
            await student.update({
                counselorEmbedding: vector,
                counselorProfileHash: currentHash
            });
        }

        // Return the vector string for use in matching queries
        return student.counselorEmbedding;
    }
}
