import { ScholarshipSource } from "../models/ScholarshipSource.js";

export class ScholarshipSourceRepository {
    static async findAllActive(): Promise<ScholarshipSource[]> {
        return ScholarshipSource.findAll({ where: { isActive: true } });
    }

    static async updateLastScraped(id: number): Promise<void> {
        await ScholarshipSource.update(
            { lastScraped: new Date() },
            { where: { id } }
        );
    }

    static async findOrCreate(data: { baseUrl: string; domainName: string; isActive?: boolean }): Promise<[ScholarshipSource, boolean]> {
        return ScholarshipSource.findOrCreate({
            where: { baseUrl: data.baseUrl },
            defaults: {
                domainName: data.domainName,
                isActive: data.isActive ?? true
            }
        });
    }
}
