import { Sequelize } from "sequelize-typescript";
import { Scholarship } from "../models/Scholarship.js";
import { Student } from "../models/Student.js";
import { MatchedScholarship } from "../types/scholarshipTypes.js";
import { Op } from "sequelize";
import { User } from "../models/User.js";

export class MatchingRepository {
    /**
     * Executes the optimized pgvector SQL search with hard filters.
     */
    static async findTopMatches(student: Student, vectorStr: string): Promise<MatchedScholarship[]> {
        // Hard filters:
        // 1. Country match (if student has a countryInterest)
        // 2. Student's academicStatus must be in scholarship.degree_levels JSON array
        const whereConditions: any[] = [];

        // if (student.countryInterest) {
        //     whereConditions.push(
        //         Sequelize.literal(`country = '${student.countryInterest.replace(/'/g, "''")}'`)
        //     );
        // }

        // if (student.academicStatus) {
        //     // Match if degree_levels contains the status OR if degree_levels is NULL (not yet tagged)
        //     whereConditions.push(
        //         Sequelize.literal(`(degree_levels @> '["${student.academicStatus.replace(/"/g, '')}"]'::jsonb OR degree_levels IS NULL)`)
        //     );
        // }

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
                'fundType', 'degree_levels', 'country', 'requirements','description','title',
                [
                    Sequelize.literal(`(1 - (embedding <=> '${vectorStr}'::halfvec(3072))) * 100`),
                    'match_score'
                ]
            ],
            order: [
                Sequelize.literal(`embedding <=> '${vectorStr}'::halfvec(3072) ASC`)
            ],
            limit: 10,
            raw: true
        });

        console.log(`[MatchingRepository] Debug - Matches found: ${matches.length}`);

        // Cast to MatchedScholarship interface
        return matches.map(m => ({
            ...m,
            match_score: parseFloat((m as any).match_score?.toString() || "0")
        })) as unknown as MatchedScholarship[];
    }
    /**
     * Finds top students for a given scholarship.
     */
    static async findTopMatchingStudentsForScholarship(scholarshipEmbedding: string, limit: number = 5): Promise<any[]> {
        // Query students whose embedding is closest to the scholarship
        // We join Users to get email/name
        const students = await Student.findAll({
            where: Sequelize.literal('embedding IS NOT NULL') as any,
            attributes: [
                'id', 'userId',
                [
                    Sequelize.literal(`(1 - (embedding <=> '${scholarshipEmbedding}'::halfvec(3072))) * 100`),
                    'match_score'
                ]
            ],
            include: [{
                model: User,
                attributes: ['name', 'email', 'fcmToken']
            }],
            order: [
                Sequelize.literal(`embedding <=> '${scholarshipEmbedding}'::halfvec(3072) ASC`)
            ],
            limit: limit,
            raw: true,
            nest: true
        });

        return students;
    }
    /**
     * Finds all students whose profile matches the given scholarship embedding above a certain score.
     */
    static async findStudentsExceedingThreshold(scholarshipEmbedding: string, threshold: number = 75): Promise<any[]> {
        const students = await Student.findAll({
            where: Sequelize.literal('embedding IS NOT NULL') as any,
            attributes: [
                'id', 'userId',
                [
                    Sequelize.literal(`(1 - (embedding <=> '${scholarshipEmbedding}'::halfvec(3072))) * 100`),
                    'match_score'
                ]
            ],
            include: [{
                model: User,
                attributes: ['name', 'email', 'fcmToken']
            }],
            having: Sequelize.literal(`(1 - (embedding <=> '${scholarshipEmbedding}'::halfvec(3072))) * 100 > ${threshold}`),
            order: [
                Sequelize.literal(`embedding <=> '${scholarshipEmbedding}'::halfvec(3072) ASC`)
            ],
            raw: true,
            nest: true
        });

        return students;
    }
}
