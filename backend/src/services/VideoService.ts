import { VideoRepository } from "../repositories/VideoRepository.js";
import { Video } from "../models/Video.js";

export class VideoService {
    static async create(data: any): Promise<Video> {
        return VideoRepository.create(data);
    }

    static async getAll(): Promise<Video[]> {
        return VideoRepository.findAll();
    }

    static async getById(id: number): Promise<Video | null> {
        return VideoRepository.findById(id);
    }

    static async update(id: number, data: any): Promise<[number, Video[]]> {
        return VideoRepository.update(id, data);
    }

    static async delete(id: number): Promise<number> {
        return VideoRepository.delete(id);
    }

    static async getFivePerType(level: string): Promise<{ [key: string]: Video[] }> {
        return VideoRepository.findFivePerType(level);
    }
}
