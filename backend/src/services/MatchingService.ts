import { Student } from "../models/Student.js";
import { VectorService } from "./VectorService.js";
import { MatchedScholarship } from "../types/scholarshipTypes.js";
import { StudentRepository } from "../repositories/StudentRepository.js";
import { MatchingRepository } from "../repositories/MatchingRepository.js";

export class MatchingService {
    /**
     * Finds the Top 5 scholarships for a student based on vector similarity and hard filters.
     * Orchestrates the flow between repository and vector service.
     */
    static async getTopMatches(userId: number): Promise<MatchedScholarship[]> {
        const student = await StudentRepository.findByUserId(userId);

        if (!student) {
            throw new Error("Student profile not found.");
        }

        if (!student.isOnboarded) {
            throw new Error("Student is not onboarded.");
        }

        // Ensure embedding is fresh (checks for changes internally)
        await VectorService.generateStudentEmbedding(student);

        if (!student.embedding) {
            throw new Error("Failed to generate student embedding.");
        }

        // Prepare the vector as a SQL-friendly string: '[0.1, 0.2, ...]'
        // pgvector returns embedding as a string from DB, but it could be an array if freshly generated
        const vectorStr = Array.isArray(student.embedding)
            ? `[${student.embedding.join(",")}]`
            : student.embedding;

        return MatchingRepository.findTopMatches(student, vectorStr);
    }
}
