import { Video } from "../models/Video.js";
import { Op } from "sequelize";

export class VideoRepository {
    static async create(data: any): Promise<Video> {
        return Video.create(data);
    }

    static async findById(id: number): Promise<Video | null> {
        return Video.findByPk(id);
    }

    static async update(id: number, data: any): Promise<[number, Video[]]> {
        return Video.update(data, {
            where: { id },
            returning: true
        });
    }

    static async delete(id: number): Promise<number> {
        return Video.destroy({
            where: { id }
        });
    }

    static async findAll(): Promise<Video[]> {
        return Video.findAll();
    }

    static async findByLevelAndType(level: string, type: string, limit: number = 2): Promise<Video[]> {
        return Video.findAll({
            where: {
                level,
                type
            },
            limit
        });
    }

    static async findFivePerType(level: string): Promise<{ [key: string]: Video[] }> {
        const types = ["Reading", "Listening", "Writing", "Speaking"];
        const result: { [key: string]: Video[] } = {};

        for (const type of types) {
            result[type.toLowerCase()] = await Video.findAll({
                where: {
                    level,
                    type: type as any
                },
                limit: 5
            });
        }

        return result;
    }
}
