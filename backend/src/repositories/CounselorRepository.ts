import { Counselor } from "../models/Counselor.js";

export class CounselorRepository {
    static async findByUserId(userId: number): Promise<Counselor | null> {
        return Counselor.findOne({ where: { userId } });
    }

    static async create(data: any): Promise<Counselor> {
        return Counselor.create(data);
    }

    static async update(userId: number, updates: any): Promise<Counselor | null> {
        const counselor = await this.findByUserId(userId);
        if (!counselor) return null;
        return counselor.update(updates);
    }
}
