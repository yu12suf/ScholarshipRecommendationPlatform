import { LearningPath } from "../models/LearningPath.js";
import { LearningPathProgress } from "../models/LearningPathProgress.js";

export class LearningPathRepository {
    static async findByStudentId(studentId: number): Promise<LearningPath | null> {
        return LearningPath.findOne({
            where: { studentId }
        });
    }

    static async create(data: any): Promise<LearningPath> {
        return LearningPath.create(data);
    }

    static async update(id: number, data: any): Promise<[number, LearningPath[]]> {
        return LearningPath.update(data, {
            where: { id },
            returning: true
        });
    }

    /**
     * Creates or updates the learning path for a student.
     * When UPDATING an existing path (i.e., after a new assessment evaluation),
     * all prior LearningPathProgress records are deleted and the progress
     * is reset to 0% so the student must complete the new content from scratch.
     */
    static async upsert(studentId: number, data: any): Promise<void> {
        const existing = await this.findByStudentId(studentId);
        if (existing) {
            // 1. Delete all old progress checkmarks for this student
            await LearningPathProgress.destroy({ where: { studentId } });

            // 2. Update the path content and explicitly reset progress to 0
            await existing.update({
                ...data,
                currentProgressPercentage: 0
            });
        } else {
            await this.create({ ...data, studentId, currentProgressPercentage: 0 });
        }
    }
}
