import { Student } from "../models/Student.js";
import { VectorService } from "./VectorService.js";
import { MatchedScholarship } from "../types/scholarshipTypes.js";
import { StudentRepository } from "../repositories/StudentRepository.js";
import { MatchingRepository } from "../repositories/MatchingRepository.js";
import { AIService } from "./AIService.js";
import { Scholarship } from "../models/Scholarship.js";
import { redisConnection } from "../config/redis.js";

export class MatchingService {
  /**
   * Finds the Top scholarships for a student based on hybrid matching:
   * 1. Vector similarity / Hard filters in DB
   * 2. AI Re-ranking for personalized results
   */
  static async getTopMatches(
    userId: number,
    filters?: any,
  ): Promise<MatchedScholarship[]> {
    const student = await StudentRepository.findByUserId(userId);

    if (!student) {
      throw new Error("Student profile not found.");
    }

    if (!student.isOnboarded) {
      throw new Error(
        "Student is not onboarded. Please complete your profile first.",
      );
    }

    // Removed the full list cache block because it caused stale discrepancies with the individual detail views.
    // Instead, we will fetch candidates and quickly hydrate them with the individual AI caches.

    // Try to refresh embedding but don't crash if AI service is down
    try {
      await VectorService.generateStudentEmbedding(student);
    } catch (err) {
      console.error(
        "[MatchingService] Failed to refresh student embedding:",
        err,
      );
    }

    // Prepare the vector for DB search
    let vectorStr: string | null = null;
    if (student.embedding) {
      const embed = student.embedding;
      if (Array.isArray(embed)) {
        vectorStr = `[${embed.join(",")}]`;
      } else if (typeof embed === "string") {
        vectorStr = embed.startsWith("[") ? embed : `[${embed}]`;
      }
    }

    // Phase 1: Retrieval from DB
    const candidates = await MatchingRepository.findTopMatches(
      student,
      vectorStr || "",
      filters,
    );

    if (!candidates.length) {
      return [];
    }

    // Phase 2: AI Re-ranking check using individual cache synchronization
    try {
      // 1. Fetch individual cached AI scores first to sync with details page
      const aiCachePipeline = redisConnection.pipeline();
      candidates.forEach(c => aiCachePipeline.get(`ai_match:${userId}:${c.id}`));
      let cachedIndividualRaw: any[] = [];
      try {
        cachedIndividualRaw = await aiCachePipeline.exec() || [];
      } catch (err) {
        console.warn("[MatchingService] Failed to pipeline fetch ai_match:", err);
      }

      const cachedAiMap = new Map<number | string, any>();
      candidates.forEach((c, i) => {
        const val = cachedIndividualRaw[i]?.[1];
        if (val) {
          try { cachedAiMap.set(c.id, JSON.parse(val)); } catch {}
        }
      });

      // 2. Identify candidates that DO NOT have an AI cache and send top 20 uncached ones to AI
      const topCandidates = candidates.filter(c => !cachedAiMap.has(c.id)).slice(0, 20);

      if (topCandidates.length > 0) {
        try {
          const aiResults = await AIService.rankScholarships(student.toJSON(), topCandidates);
          
          // Save valid AI results to the individual caches
          const savePipeline = redisConnection.pipeline();
          aiResults.forEach((r: any) => {
            savePipeline.set(`ai_match:${userId}:${r.id}`, JSON.stringify(r), "EX", 3600 * 24);
            cachedAiMap.set(Number(r.id), r);
          });
          await savePipeline.exec();
        } catch (err: any) {
             if (err.status === 429 || err.message?.includes("429")) {
                console.warn("[MatchingService] AI Rate limit hit (429). Falling back to hybrid vector-heuristic scoring.");
             } else {
                console.error("[MatchingService] AI Re-ranking failed:", err);
             }
        }
      }

      // 3. Map all candidates using the synced AI map or hybrid fallback
      const finalResults = candidates.map((c) => {
        const aiMatch = cachedAiMap.get(c.id) || cachedAiMap.get(String(c.id));
        let score = c.matchScore || 0;
        let reason = null;

        if (aiMatch && aiMatch.match_score) {
          score = aiMatch.match_score;
          reason = aiMatch.match_reason;
        } else {
          // Pure hybrid for unranked candidates
          const hScore = MatchingService.calculateHeuristicScore(student, c);
          score = Math.round((score * 0.7) + (hScore * 0.3));
        }

        return {
          ...c,
          matchScore: score,
          matchReason: reason,
        };
      }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      return finalResults;
    } catch (err: any) {
      console.error("[MatchingService] List mapping failed, falling back:", err);
      return candidates.map(c => ({
          ...c,
          matchScore: Math.round(((c.matchScore || 0) * 0.7) + (MatchingService.calculateHeuristicScore(student, c) * 0.3))
      })).sort((a,b) => (b.matchScore || 0) - (a.matchScore || 0));
    }
  }

  /**
   * Calculates a heuristic match score based on student profile and scholarship details.
   * Eliminates the hardcoded 50% fallback.
   */
  private static calculateHeuristicScore(
    student: Student,
    scholarship: MatchedScholarship,
  ): number {
    let score = 25; // Base confidence for passing initial filters
    
    const sData = student.toJSON() as any;
    
    // DEBUG LOG
    // console.log(`[Scoring] Scholarship: ${scholarship.title} | Student: ${sData.id}`);

    // 1. Location Match (Max 30)
    if (scholarship.country) {
      if (sData.countryInterest === scholarship.country) {
        score += 30;
      } else if (
        sData.preferredCountries &&
        (Array.isArray(sData.preferredCountries)
          ? sData.preferredCountries.includes(scholarship.country)
          : JSON.stringify(sData.preferredCountries).includes(
              scholarship.country,
            ))
      ) {
        score += 15;
      }
    } else {
      // Global/No country specified usually implies broad eligibility
      score += 10;
    }

    // 2. Degree Level Match (Max 20)
    const sLevels = [sData.degreeSeeking, sData.preferredDegreeLevel]
      .filter(Boolean)
      .map((s) => s?.toLowerCase());
    const schLevels =
      (scholarship as any).degree_levels || scholarship.degreeLevels;

    if (schLevels) {
      // Use standard JSON string comparison or include in text search
      const schLevelsStr = Array.isArray(schLevels) ? schLevels.join(',').toLowerCase() : String(schLevels).toLowerCase();
      if (sLevels.some((l) => schLevelsStr.includes(l!))) {
        score += 20;
      }
    }

    // 3. Field of Study / Major Match (Max 20)
    if (sData.fieldOfStudy) {
      const field = sData.fieldOfStudy.toLowerCase();
      const textToSearch = (
        (scholarship.title || "") +
        " " +
        (scholarship.description || "")
      ).toLowerCase();
      if (textToSearch.includes(field)) {
        score += 20;
      }
    }

    // 4. GPA Check (Simple) (Max 10)
    // If student has a high GPA, boost them slightly generally
    if (sData.calculatedGpa && sData.calculatedGpa >= 3.5) {
      score += 10;
    } else if (sData.calculatedGpa && sData.calculatedGpa >= 3.0) {
      score += 5;
    }

    // 5. Text-based description search boost (Max 15)
    if (sData.researchArea || sData.bio) {
        const keywords = (sData.researchArea || "" + " " + (sData.bio || "")).toLowerCase().split(/\s+/).filter((s: string) => s.length > 3);
        const description = (scholarship.description || "").toLowerCase();
        
        const matchesCount = keywords.filter((k: string) => description.includes(k)).length;
        if (matchesCount > 0) {
            score += Math.min(matchesCount * 3, 15);
        }
    }

    // Cap at 98 to leave room for AI refined matches
    return Math.min(score, 98);
  }

  /**
   * Gets a single scholarship with its match data for a specific student.
   */
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

    const vectorScore = candidate.matchScore || 0;
    const hScore = MatchingService.calculateHeuristicScore(student, candidate);
    let score = vectorScore > 0 ? Math.round((vectorScore * 0.7) + (hScore * 0.3)) : hScore;
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
        score = aiMatch.match_score || score;
        reason = aiMatch.match_reason || reason;
        console.log(`[MatchingService] AI ranked scholarship ${candidate.id}: ${score}%`);
      } else {
        console.warn(`[MatchingService] AI Response missing ID ${candidate.id}. Using heuristic.`);
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

    candidate.matchScore = score;
    candidate.matchReason = reason;

    return candidate as MatchedScholarship;
  }
}
