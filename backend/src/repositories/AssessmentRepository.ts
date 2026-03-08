import { AssessmentResult } from "../models/AssessmentResult.js";
import { WhereOptions } from "sequelize";

export class AssessmentRepository {
    /**
     * Create a new assessment result record.
     */
    static async create(data: any): Promise<AssessmentResult> {
        return AssessmentResult.create(data);
    }

    /**
     * Get student progress with optional filtering by exam type.
     * results are returned in ascending order by creation time.
     */
    static async getStudentProgress(studentId: number, examType?: string): Promise<AssessmentResult[]> {
        const where: WhereOptions = { studentId };

        if (examType) {
            where.examType = examType;
        }

        console.log(`Searching progress for studentId: ${studentId}, examType: ${examType}`);
        const results = await AssessmentResult.findAll({
            where,
            order: [["createdAt", "ASC"]],
        });
        console.log(`Found ${results.length} results`);
        return results;
    }
}
