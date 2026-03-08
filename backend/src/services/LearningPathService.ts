import { LearningPathRepository } from "../repositories/LearningPathRepository.js";
import { VideoRepository } from "../repositories/VideoRepository.js";
import { Video } from "../models/Video.js";

export class LearningPathService {
    /**
     * Maps overall band score to a difficulty level (easy, medium, hard).
     */
    private static mapScoreToLevel(overallBand: number): 'easy' | 'medium' | 'hard' {
        if (overallBand < 5.0) return 'easy';
        if (overallBand < 7.0) return 'medium';
        return 'hard';
    }

    /**
     * Generates a new learning path or updates existing one based on evaluation.
     */
    static async generateForStudent(studentId: number, evaluation: any) {
        const overallBand = evaluation.evaluation?.overall_band || 0;
        const level = this.mapScoreToLevel(overallBand);

        // 1. Fetch 5 videos per skill matching the student's level
        const videoMap = await VideoRepository.findFivePerType(level);

        const videoSections = {
            reading: videoMap['reading']?.map(v => v.id) || [],
            listening: videoMap['listening']?.map(v => v.id) || [],
            writing: videoMap['writing']?.map(v => v.id) || [],
            speaking: videoMap['speaking']?.map(v => v.id) || []
        };

        // 2. Extract skill-based notes from AI evaluation
        // We expect AI to return section_notes, if not, we fallback to general feedback
        const aiNotes = evaluation.evaluation?.section_notes || {};
        const generalFeedback = evaluation.evaluation?.feedback_report || "Continue practicing all skills.";

        const noteSections = {
            reading: aiNotes.reading || generalFeedback,
            listening: aiNotes.listening || generalFeedback,
            writing: aiNotes.writing || generalFeedback,
            speaking: aiNotes.speaking || generalFeedback
        };

        // 3. Persist the learning path
        await LearningPathRepository.upsert(studentId, {
            videoSections,
            noteSections
        });
    }

    /**
     * Retrieves the learning path formatted for the frontend.
     */
    static async getFormattedPath(studentId: number) {
        const path = await LearningPathRepository.findByStudentId(studentId);
        if (!path) return null;

        const skills = ['reading', 'listening', 'writing', 'speaking'];
        const result: any = {};

        for (const skill of skills) {
            const videoIds = (path.videoSections as any)[skill] || [];
            // Fetch video details for each ID
            const videos = await Promise.all(
                videoIds.map((id: number) => VideoRepository.findById(id))
            );

            result[skill] = {
                videos: videos.filter(v => v !== null),
                notes: (path.noteSections as any)[skill] || ""
            };
        }

        return result;
    }
}
