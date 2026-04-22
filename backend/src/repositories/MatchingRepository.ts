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
  static async findTopMatches(
    student: Student,
    vectorStr: string,
    filters?: any,
  ): Promise<MatchedScholarship[]> {
    const hardWhereConditions: any[] = [];
    const optionalWhereConditions: any[] = [];

    const safeParse = (str: any) => {
      if (!str) return [];
      try {
        if (typeof str === "string") return JSON.parse(str);
        return str;
      } catch {
        return [];
      }
    };

    // Removed rigid SQL profile constraints to allow true AI vector discovery.
    // Geographical and Academic alignment is evaluated holistically during Scoring.

    // --- OPTIONAL FILTERS (From Search Bar/UI) ---
    if (filters) {
      if (filters.query) {
        optionalWhereConditions.push({
          [Op.or]: [
            { title: { [Op.iLike]: `%${filters.query}%` } },
            { description: { [Op.iLike]: `%${filters.query}%` } },
          ],
        });
      }
      if (filters.country) {
        optionalWhereConditions.push({ country: filters.country });
      }
      if (filters.degreeLevel || filters.degree_level) {
        const levelToFilter = filters.degreeLevel || filters.degree_level;
        optionalWhereConditions.push(
          Sequelize.literal(
            `degree_levels @> '["${levelToFilter.replace(/"/g, "")}"]'::jsonb`,
          ),
        );
      }
      if (filters.fundType || filters.fund_type) {
        optionalWhereConditions.push({
          fundType: filters.fundType || filters.fund_type,
        });
      }
    }

    const mapResult = (scholarship: Scholarship) => {
      const data = scholarship.get({ plain: true });
      return {
        ...data,
        matchScore: parseFloat(
          (scholarship as any).getDataValue("matchScore")?.toString() || "0",
        ),
      } as any;
    };

    // Only apply the UI filters strictly at the DB query level.
    // Profile-based matching (Country, Level) is handled gracefully by the Heuristic AI Scoring in MatchingService.
    const strictWhere = optionalWhereConditions.length > 0
        ? { [Op.and]: optionalWhereConditions }
        : {};

    const runQuery = async (
      whereClause: any,
    ): Promise<MatchedScholarship[]> => {
      if (hasVectorExtension && vectorStr && vectorStr.length > 5) {
        try {
          const matches = await Scholarship.findAll({
            where: whereClause,
            attributes: {
              include: [
                [
                  Sequelize.literal(
                    `(1 - (embedding <=> '${vectorStr}'::vector)) * 100`,
                  ),
                  "matchScore",
                ],
              ],
            },
            order: [
              Sequelize.literal(
                `CAST(embedding::text AS vector) <=> '${vectorStr}'::vector ASC`,
              ),
            ],
            limit: 20,
          });
          return matches.map(mapResult);
        } catch (err: any) {
          console.error(
            "[MatchingRepository] Vector search failed:",
            err.message,
          );
        }
      }

      const matches = await Scholarship.findAll({
        where: whereClause,
        attributes: {
          include: [[Sequelize.literal("0"), "matchScore"]],
        },
        order: [["createdAt", "DESC"]],
        limit: 20,
      });
      return matches.map(mapResult);
    };

    const strictMatches = await runQuery(strictWhere);
    return strictMatches;
  }

  /**
   * Gets a single scholarship with its calculated vector match score.
   */
  static async findMatchWithScore(
    student: Student,
    scholarshipId: number,
    vectorStr: string,
  ): Promise<MatchedScholarship | null> {
    const hasVector = hasVectorExtension && vectorStr && vectorStr.length > 5;

    const scholarship = await Scholarship.findByPk(scholarshipId, {
      attributes: {
        include: hasVector
          ? [
              [
                Sequelize.literal(
                  `(1 - (embedding <=> '${vectorStr}'::vector)) * 100`,
                ),
                "matchScore",
              ],
            ]
          : [[Sequelize.literal("0"), "matchScore"]],
      },
    });

    if (!scholarship) return null;

    const data = scholarship.get({ plain: true });
    return {
      ...data,
      matchScore: parseFloat(
        (scholarship as any).getDataValue("matchScore")?.toString() || "0",
      ),
    } as any;
  }

  /**
   * Finds top students for a given scholarship.
   */
  static async findTopMatchingStudentsForScholarship(
    scholarshipEmbedding: string,
    limit: number = 5,
  ): Promise<any[]> {
    // Query students whose embedding is closest to the scholarship
    // We join Users to get email/name
    const students = await Student.findAll({
      where: Sequelize.literal("embedding IS NOT NULL") as any,
      attributes: [
        "id",
        "userId",
        [
          Sequelize.literal(
            `(1 - (embedding <=> '${scholarshipEmbedding}'::vector)) * 100`,
          ),
          "match_score",
        ],
      ],
      include: [
        {
          model: User,
          attributes: ["name", "email", "fcmToken"],
        },
      ],
      order: [
        Sequelize.literal(
          `embedding <=> '${scholarshipEmbedding}'::vector ASC`,
        ),
      ],
      limit: limit,
      raw: true,
      nest: true,
    });

    return students;
  }
  /**
   * Finds all students whose profile matches the given scholarship embedding above a certain score.
   */
  static async findStudentsExceedingThreshold(
    scholarshipEmbedding: string,
    threshold: number = 75,
  ): Promise<any[]> {
    const students = await Student.findAll({
      where: Sequelize.literal("embedding IS NOT NULL") as any,
      attributes: [
        "id",
        "userId",
        [
          Sequelize.literal(
            `(1 - (embedding <=> '${scholarshipEmbedding}'::vector)) * 100`,
          ),
          "match_score",
        ],
      ],
      include: [
        {
          model: User,
          attributes: ["name", "email", "fcmToken"],
        },
      ],
      having: Sequelize.literal(
        `(1 - (embedding <=> '${scholarshipEmbedding}'::vector)) * 100 > ${threshold}`,
      ),
      order: [
        Sequelize.literal(
          `embedding <=> '${scholarshipEmbedding}'::vector ASC`,
        ),
      ],
      raw: true,
      nest: true,
    });

    return students;
  }
}
