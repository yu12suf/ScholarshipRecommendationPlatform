import { LearningPath } from "../models/LearningPath.js";

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

    static async upsert(studentId: number, data: any): Promise<void> {
        const existing = await this.findByStudentId(studentId);
        if (existing) {
            await existing.update(data);
        } else {
            await this.create({ ...data, studentId });
        }
    }
}
