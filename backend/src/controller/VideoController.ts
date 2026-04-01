import { Request, Response } from "express";
import { VideoService } from "../services/VideoService.js";

export class VideoController {
    static async create(req: Request, res: Response) {
        try {
            const video = await VideoService.create(req.body);
            return res.status(201).json({
                success: true,
                data: video
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getAll(req: Request, res: Response) {
        try {
            const videos = await VideoService.getAll();
            return res.status(200).json({
                success: true,
                data: videos
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const video = await VideoService.getById(Number(id));
            if (!video) {
                return res.status(404).json({
                    success: false,
                    error: "Video not found"
                });
            }
            return res.status(200).json({
                success: true,
                data: video
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const [affectedCount, updatedVideos] = await VideoService.update(Number(id), req.body);
            if (affectedCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Video not found"
                });
            }
            return res.status(200).json({
                success: true,
                data: updatedVideos[0]
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const affectedCount = await VideoService.delete(Number(id));
            if (affectedCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Video not found"
                });
            }
            return res.status(200).json({
                success: true,
                message: "Video deleted successfully"
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}
