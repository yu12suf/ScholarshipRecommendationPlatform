import { Op } from "sequelize";
import { Scholarship } from "../models/Scholarship.js";

export class ScholarshipRepository {
    static async findAll(filters: any): Promise<Scholarship[]> {
        const { query, country, degree_level, fund_type } = filters;
        const where: any = {};

        if (query) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${query}%` } },
                { description: { [Op.iLike]: `%${query}%` } }
            ];
        }

        if (country) {
            where.country = { [Op.iLike]: `%${country}%` };
        }

        if (fund_type) {
            where.fundType = { [Op.iLike]: `%${fund_type}%` };
        }

        if (degree_level) {
            // Check if any element in the degree_levels JSONB array matches
            where.degreeLevels = {
                [Op.contains]: [degree_level]
            };
        }

        return Scholarship.findAll({
            where,
            limit: 50,
            order: [['created_at', 'DESC']]
        });
    }

    static async create(data: Partial<Scholarship>): Promise<Scholarship> {
        return Scholarship.create(data);
    }

    static async existsByOriginalUrl(originalUrl: string): Promise<boolean> {
        const count = await Scholarship.count({ where: { originalUrl } });
        return count > 0;
    }

    static async upsert(data: Partial<Scholarship>): Promise<[Scholarship, boolean | null]> {
        return Scholarship.upsert(data);
    }
}
