import { Student } from "../models/Student.js";
import { VectorService } from "./VectorService.js";
import { MatchedScholarship } from "../types/scholarshipTypes.js";
import { StudentRepository } from "../repositories/StudentRepository.js";
import { MatchingRepository } from "../repositories/MatchingRepository.js";
import { AIService } from "./AIService.js";
import { Scholarship } from "../models/Scholarship.js";

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

    // Phase 2: AI Re-ranking (Limited to top 10 candidates to improve list-to-detail consistency)
    const topCandidates = candidates.slice(0, 10); 
    const remainingCandidates = candidates.slice(10);

    try {
      const aiResults = await AIService.rankScholarships(
        student.toJSON(),
        topCandidates,
      );

      // Map AI scores back to top candidates
      const rankedMatches = topCandidates.map((c) => {
        const aiMatch = aiResults.find(
          (r: any) => String(r.id) === String(c.id),
        );

        let score = c.matchScore || MatchingService.calculateHeuristicScore(student, c);
        let reason = "High-precision match based on academic profile similarity.";

        if (aiMatch) {
          score = aiMatch.match_score;
          reason = aiMatch.match_reason;
        }

        return {
          ...c,
          matchScore: score,
          matchReason: reason,
        };
      });

      // Pure hybrid for remaining candidates (skipped by AI)
      const unrankedMatches = remainingCandidates.map((c) => {
        // Boost vector score with specific heuristic verification
        const hScore = MatchingService.calculateHeuristicScore(student, c);
        const vectorScore = c.matchScore || 0;
        
        // Final score: 70% vector similarity + 30% rule-based verification
        const finalScore = Math.round((vectorScore * 0.7) + (hScore * 0.3));
        
        return {
          ...c,
          matchScore: finalScore,
          matchReason: null,
        };
      });

      // Merge and sort
      return [...rankedMatches, ...unrankedMatches].sort(
        (a, b) => (b.matchScore || 0) - (a.matchScore || 0),
      );
    } catch (err: any) {
      if (err.status === 429 || err.message?.includes("429")) {
        console.warn(
          "[MatchingService] AI Rate limit hit (429). Falling back to hybrid vector-heuristic scoring.",
        );
      } else {
        console.error(
          "[MatchingService] AI Re-ranking failed, falling back to hybrid scores:",
          err,
        );
      }

      // Hybrid fallback strategy
      return candidates
        .map((c) => {
          const hScore = MatchingService.calculateHeuristicScore(student, c);
          const vectorScore = c.matchScore || 0;
          const finalScore = Math.round((vectorScore * 0.7) + (hScore * 0.3));
          
          return {
            ...c,
            matchScore: finalScore,
            matchReason: null,
          };
        })
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
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

    const scholarship = await Scholarship.findByPk(scholarshipId);
    if (!scholarship) return null;

    // Simplified match for a single item - just wrap it as a candidate
    const candidate = scholarship.get({ plain: true }) as any;

    const vectorScore = candidate.matchScore || 0;
    const hScore = MatchingService.calculateHeuristicScore(student, candidate);
    let score = vectorScore > 0 ? Math.round((vectorScore * 0.7) + (hScore * 0.3)) : hScore;
    let reason = null;

    try {
      // Re-rank this single candidate via AI for precise details
      const aiResults = await AIService.rankScholarships(student.toJSON(), [
        candidate,
      ]);

      // Use robust ID matching for single candidate too
      const aiMatch = aiResults.find(
        (r: any) => String(r.id) === String(candidate.id),
      );

      if (aiMatch) {
        score = aiMatch.match_score || score;
        reason = aiMatch.match_reason || reason;
        console.log(`[MatchingService] AI successfully ranked scholarship ${candidate.id}: ${score}%`);
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
