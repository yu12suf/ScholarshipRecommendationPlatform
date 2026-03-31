import { LearningPathRepository } from "../repositories/LearningPathRepository.js";
import { VideoService } from "../services/VideoService.js";
import { Video } from "../models/Video.js";
import { LearningPathProgress } from "../models/LearningPathProgress.js";

export class LearningPathService {
  /**
   * Maps overall band score to a difficulty level (easy, medium, hard).
   */
  private static mapScoreToLevel(
    overallBand: number,
  ): "easy" | "medium" | "hard" {
    if (overallBand < 5.0) return "easy";
    if (overallBand < 7.0) return "medium";
    return "hard";
  }

  /**
   * Generates a new learning path or updates existing one based on evaluation.
   */
  static async generateForStudent(
    studentId: number,
    evaluation: any,
    examType: "IELTS" | "TOEFL" = "IELTS",
  ) {
    const overallBand = evaluation.evaluation?.overall_band || 0;
    const level = this.mapScoreToLevel(overallBand);

    // 1. Fetch 5 videos per skill matching the student's level and exam type
    const videoMap = await VideoService.getFivePerType(level, examType);

    const videoSections = {
      reading: videoMap["reading"]?.map((v) => v.id) || [],
      listening: videoMap["listening"]?.map((v) => v.id) || [],
      writing: videoMap["writing"]?.map((v) => v.id) || [],
      speaking: videoMap["speaking"]?.map((v) => v.id) || [],
    };

    // 2. Extract skill-based notes from AI evaluation
    // We expect AI to return section_notes, if not, we fallback to general feedback
    const aiNotes = evaluation.evaluation?.section_notes || {};
    const generalFeedback =
      evaluation.evaluation?.feedback_report ||
      "Continue practicing all skills.";

    const noteSections = {
      reading: aiNotes.reading || generalFeedback,
      listening: aiNotes.listening || generalFeedback,
      writing: aiNotes.writing || generalFeedback,
      speaking: aiNotes.speaking || generalFeedback,
    };

    // 3. Extract Learning Mode Sections (Practice Questions)
    const learningModeSections = evaluation.evaluation?.learning_mode || {
      reading: [],
      listening: [],
      writing: [],
      speaking: [],
    };

    // 4. Extract Competency Gap and Curriculum Map
    const competencyGapAnalysis = evaluation.evaluation?.competency_gap_analysis || null;
    const curriculumMap = evaluation.evaluation?.adaptive_curriculum_map || null;

    // 5. Persist the learning path
    await LearningPathRepository.upsert(studentId, {
      videoSections,
      noteSections,
      learningModeSections,
      competencyGapAnalysis,
      curriculumMap,
      proficiencyLevel: level,
      examType,
    });
  }

  /**
   * Retrieves the learning path formatted for the frontend.
   */
  static async getFormattedPath(studentId: number) {
    const path = await LearningPathRepository.findByStudentId(studentId);
    if (!path) return null;

    const skills = ["reading", "listening", "writing", "speaking"];
    const result: any = {};
    let totalVideos = 0;
    let completedVideos = 0;

    for (const skill of skills) {
      const videoIds = (path.videoSections as any)[skill] || [];

      // Fetch video details for each ID
      const videosProgress = await Promise.all(
        videoIds.map(async (id: number) => {
          const video = await VideoService.getById(id);
          if (!video) return null;

          const progress = await LearningPathProgress.findOne({
            where: {
              studentId,
              videoId: id,
            },
          });

          const isCompleted = progress?.isCompleted || false;
          totalVideos++;
          if (isCompleted) {
            completedVideos++;
          }

          return {
            ...video.get({ plain: true }),
            isCompleted: isCompleted,
          };
        }),
      );

      result[skill] = {
        videos: videosProgress.filter((v) => v !== null),
        notes: (path.noteSections as any)[skill] || "",
      };
    }

    const progressPercentage = totalVideos === 0 ? 0 : Math.round((completedVideos / totalVideos) * 100);
    // Update the record in the database
    if (path.currentProgressPercentage !== progressPercentage) {
      path.currentProgressPercentage = progressPercentage;
      await path.save();
    }

    return {
      proficiencyLevel: path.proficiencyLevel,
      examType: path.examType,
      skills: result,
      learningMode: path.learningModeSections,
      competencyGapAnalysis: path.competencyGapAnalysis,
      curriculumMap: path.curriculumMap,
      current_progress_percentage: progressPercentage
    };
  }
}
