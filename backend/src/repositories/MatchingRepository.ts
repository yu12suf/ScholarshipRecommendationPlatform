import { Sequelize } from "sequelize-typescript";
import { Scholarship } from "../models/Scholarship.js";
import { Student } from "../models/Student.js";
import { MatchedScholarship } from "../types/scholarshipTypes.js";
import { Op } from "sequelize";

export class MatchingRepository {
    /**
     * Executes the optimized pgvector SQL search with hard filters.
     */
    static async findTopMatches(student: Student, vectorStr: string): Promise<MatchedScholarship[]> {
        // Hard filters:
        // 1. Country match (if student has a countryInterest)
        // 2. Student's academicStatus must be in scholarship.degree_levels JSON array
        const whereConditions: any[] = [];

        if (student.countryInterest) {
            whereConditions.push(
                Sequelize.literal(`country = '${student.countryInterest.replace(/'/g, "''")}'`)
            );
        }

        if (student.academicStatus) {
            // Match if degree_levels contains the status OR if degree_levels is NULL (not yet tagged)
            whereConditions.push(
                Sequelize.literal(`(degree_levels @> '["${student.academicStatus.replace(/"/g, '')}"]'::jsonb OR degree_levels IS NULL)`)
            );
        }

        console.log(`[MatchingRepository] Debug - Student: countryInterest=${student.countryInterest}, academicStatus=${student.academicStatus}`);
        console.log(`[MatchingRepository] Debug - Where conditions count: ${whereConditions.length}`);
        console.log(`[MatchingRepository] Debug - Vector string length: ${vectorStr?.length}`);

        // First check: how many scholarships exist at all?
        const totalCount = await Scholarship.count();
        const withEmbedding = await Scholarship.count({ where: Sequelize.literal('embedding IS NOT NULL') as any });
        console.log(`[MatchingRepository] Debug - Total scholarships: ${totalCount}, with embeddings: ${withEmbedding}`);

        const matches = await Scholarship.findAll({
            where: whereConditions.length > 0
                ? { [Op.and]: whereConditions } as any
                : {},
            attributes: [
                'id', 'title', 'description', 'amount', 'deadline',
                'fundType', 'degree_levels', 'country', 'originalUrl',
                [
                    Sequelize.literal(`(1 - (embedding <=> '${vectorStr}'::vector)) * 100`),
                    'match_score'
                ]
            ],
            order: [
                Sequelize.literal(`embedding <=> '${vectorStr}'::vector ASC`)
            ],
            limit: 5,
            raw: true
        });

        console.log(`[MatchingRepository] Debug - Matches found: ${matches.length}`);

        // Cast to MatchedScholarship interface
        return matches.map(m => ({
            ...m,
            match_score: parseFloat((m as any).match_score?.toString() || "0")
        })) as unknown as MatchedScholarship[];
    }
}
