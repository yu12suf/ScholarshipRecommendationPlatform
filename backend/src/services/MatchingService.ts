import { Student } from "../models/Student.js";
import { VectorService } from "./VectorService.js";
import { MatchedScholarship } from "../types/scholarshipTypes.js";
import { StudentRepository } from "../repositories/StudentRepository.js";
import { MatchingRepository } from "../repositories/MatchingRepository.js";
import { AIService } from "./AIService.js";
import { Scholarship } from "../models/Scholarship.js";
import { redisConnection } from "../config/redis.js";

export class MatchingService {

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
    // Our model now handles formatting via setter, but we explicitly format here for the raw SQL query
    const vectorStr = Array.isArray(student.embedding)
      ? `[${student.embedding.join(",")}]`
      : student.embedding;

    return MatchingRepository.findTopMatches(student, vectorStr);
  }



  static async getMatchById(
    userId: number,
    scholarshipId: number,
  ): Promise<MatchedScholarship | null> {
    const student = await StudentRepository.findByUserId(userId);
    if (!student) throw new Error("Student not found");

    // Refresh embedding for consistency
    try {
      await VectorService.generateStudentEmbedding(student);
    } catch (err) {
      console.warn("[MatchingService] Failed to refresh student embedding for detail view:", err);
    }

    // Prepare the vector for calculation consistency
    let vectorStr: string | null = null;
    if (student.embedding) {
      const embed = student.embedding;
      if (Array.isArray(embed)) {
        vectorStr = `[${embed.join(",")}]`;
      } else if (typeof embed === "string") {
        vectorStr = embed.startsWith("[") ? embed : `[${embed}]`;
      }
    }

    const candidate = await MatchingRepository.findMatchWithScore(student, scholarshipId, vectorStr || "");
    if (!candidate) return null;

    const vectorScore = candidate.match_score || 0;

    // The user requested that the match percentage be directly the result of pgvector.
    // If vectorScore exists, we use it exactly as calculated by the database. 
    // We only fallback to 0 if the vector score failed to calculate.
    let score = vectorScore > 0 ? vectorScore : 0;
    let reason = null;

    try {
      const cacheKey = `ai_match:${userId}:${scholarshipId}`;
      const cachedAiMatch = await redisConnection.get(cacheKey);

      let aiMatch = null;
      if (cachedAiMatch) {
        aiMatch = JSON.parse(cachedAiMatch);
        console.log(`[MatchingService] Using CACHED AI matching score for scholarship ${candidate.id}`);
      } else {
        // Re-rank this single candidate via AI for precise details
        const aiResults = await AIService.rankScholarships(student.toJSON(), [
          candidate,
        ]);

        // Use robust ID matching for single candidate too
        aiMatch = aiResults.find(
          (r: any) => String(r.id) === String(candidate.id),
        );

        if (aiMatch) {
          // Cache it for next time
          await redisConnection.set(cacheKey, JSON.stringify(aiMatch), "EX", 3600 * 24);
        }
      }

      if (aiMatch) {
        // We completely ignore aiMatch.match_score if we have a valid pgvector score, 
        // ensuring the percentage is purely driven by the vector distance.
        if (vectorScore <= 0) {
          score = aiMatch.match_score || score;
        }
        reason = aiMatch.match_reason || reason;
        console.log(`[MatchingService] AI provided reasoning for scholarship ${candidate.id}. Pure pgvector score kept at: ${score}%`);
      } else {
        console.warn(`[MatchingService] AI Response missing ID ${candidate.id}. Using vector/heuristic.`);
      }
    } catch (err: any) {
      if (err.status === 429 || err.message?.includes("429")) {
        console.warn(
          "[MatchingService] AI Rate limit hit (429) for single item. Using heuristic score.",
        );
      } else {
        console.error(
          "[MatchingService] AI ranking failed for single item:",
          err,
        );
      }
      // Keep heuristic
    }

    candidate.match_score = score;
    candidate.match_reason = reason;

    return candidate as MatchedScholarship;
  }
}
