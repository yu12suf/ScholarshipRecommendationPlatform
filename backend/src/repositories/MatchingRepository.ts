import { Sequelize } from "sequelize-typescript";
import { hasVectorExtension } from "../config/sequelize.js";
import { Scholarship } from "../models/Scholarship.js";
import { Student } from "../models/Student.js";
import { MatchedScholarship } from "../types/scholarshipTypes.js";
import { Op } from "sequelize";
import { User } from "../models/User.js";

export class MatchingRepository {
    /**
     * Executes the optimized pgvector SQL search with hard filters and optional query filters.
     */
    static async findTopMatches(student: Student, vectorStr: string, filters?: any): Promise<MatchedScholarship[]> {
        const whereConditions: any[] = [];

        const safeParse = (str: any) => {
            if (!str) return [];
            try {
                if (typeof str === 'string') return JSON.parse(str);
                return str; 
            } catch {
                return [];
            }
        };

        // --- HARD FILTERS DISABLED FOR NOW - Show all scholarships ---
        
        // Skip all filtering for now - just show all scholarships

        console.log("[MatchingRepository] All filtering disabled, showing all scholarships");

        // --- OPTIONAL FILTERS (From Search Bar/UI) ---
        if (filters) {
            if (filters.query) {
                whereConditions.push({
                    [Op.or]: [
                        { title: { [Op.iLike]: `%${filters.query}%` } },
                        { description: { [Op.iLike]: `%${filters.query}%` } }
                    ]
                });
            }
            if (filters.country) {
                whereConditions.push({ country: filters.country });
            }
            if (filters.degreeLevel || filters.degree_level) {
                const levelToFilter = filters.degreeLevel || filters.degree_level;
                whereConditions.push(Sequelize.literal(`degree_levels @> '["${levelToFilter.replace(/"/g, '')}"]'::jsonb`));
            }
            if (filters.fundType || filters.fund_type) {
                whereConditions.push({ fundType: filters.fundType || filters.fund_type });
            }
        }

        const mapResult = (scholarship: Scholarship) => {
            const data = scholarship.get({ plain: true });
            return {
                ...data,
                matchScore: parseFloat((scholarship as any).getDataValue('matchScore')?.toString() || "0")
            } as any;
        };

        const finalWhere = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};

        // Always use fallback for now - skip vector search entirely
        console.log("[MatchingRepository] Returning all scholarships without filtering");
        const matches = await Scholarship.findAll({
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        console.log(`[MatchingRepository] Found ${matches.length} scholarships`);
        return matches.map(mapResult);
    }

    /**
     * Gets a single scholarship with its calculated vector match score.
     */
    static async findMatchWithScore(student: Student, scholarshipId: number, vectorStr: string): Promise<MatchedScholarship | null> {
        const hasVector = hasVectorExtension && vectorStr && vectorStr.length > 5;
        
        const scholarship = await Scholarship.findByPk(scholarshipId, {
            attributes: {
                include: hasVector ? [
                    [
                        Sequelize.literal(`(1 - (embedding <=> '${vectorStr}'::vector)) * 100`),
                        'matchScore'
                    ]
                ] : [
                    [Sequelize.literal('0'), 'matchScore']
                ]
            }
        });

        if (!scholarship) return null;

        const data = scholarship.get({ plain: true });
        return {
            ...data,
            matchScore: parseFloat((scholarship as any).getDataValue('matchScore')?.toString() || "0")
        } as any;
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
