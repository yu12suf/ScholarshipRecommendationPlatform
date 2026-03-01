import { Scholarship } from "../models/Scholarship.js";

export class ScholarshipRepository {
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
