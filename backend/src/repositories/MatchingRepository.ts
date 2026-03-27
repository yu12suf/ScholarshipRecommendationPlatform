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

        // --- HARD FILTERS (From Student Profile) ---
        
        // 1. Country match (Include scholarships with no country specified as they might be global)
        const preferredCountries = safeParse(student.preferredCountries);
        if (preferredCountries && Array.isArray(preferredCountries) && preferredCountries.length > 0) {
            whereConditions.push({
                [Op.or]: [
                    { country: { [Op.in]: preferredCountries } },
                    { country: null },
                    { country: "" }
                ]
            });
        } else if (student.countryInterest) {
            whereConditions.push({
                [Op.or]: [
                    { country: student.countryInterest },
                    { country: null },
                    { country: "" }
                ]
            });
        }

        // 2. Academic Level match (JSONB check - be inclusive of unknown levels)
        const normalizeLevel = (l: string) => l.replace(/'s/g, '').trim();
        const preferredLevels = safeParse(student.preferredDegreeLevel);
        const rawLevels = [...new Set([student.degreeSeeking, ...(Array.isArray(preferredLevels) ? preferredLevels : [])])].filter(Boolean);
        const levelsToMatch = rawLevels.map(normalizeLevel);
        
        if (levelsToMatch.length > 0) {
            // Using ?| operator to check if any level matches in the JSONB array, or if it's not specified
            // We include both normalized and raw versions just in case
            const allLevels = [...new Set([...levelsToMatch, ...rawLevels])];
            const levelsArr = allLevels.map(l => `'${l.replace(/'/g, "''")}'`).join(',');
            whereConditions.push({
                [Op.or]: [
                    Sequelize.literal(`degree_levels ?| array[${levelsArr}]`),
                    { degree_levels: null }
                ]
            });
        }

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

        // Only attempt vector search if extension exists AND we have a valid vector string
        if (hasVectorExtension && vectorStr && vectorStr.length > 5) {
            try {
                // Robust casting and calculation
                const matches = await Scholarship.findAll({
                    where: finalWhere,
                    attributes: {
                        include: [
                            [
                                Sequelize.literal(`(1 - (embedding <=> '${vectorStr}'::vector)) * 100`),
                                'matchScore'
                            ]
                        ]
                    },
                    order: [
                        Sequelize.literal(`CAST(embedding::text AS vector) <=> '${vectorStr}'::vector ASC`)
                    ],
                    limit: 20
                });
                return matches.map(mapResult);
            } catch (err: any) {
                console.error("[MatchingRepository] Vector search failed:", err.message);
            }
        }

        // Fallback: Default ranking
        const matches = await Scholarship.findAll({
            where: finalWhere,
            attributes: {
                include: [
                    [Sequelize.literal('0'), 'matchScore']
                ]
            },
            order: [['createdAt', 'DESC']],
            limit: 20
        });
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
