import { Request, Response } from "express";
import { ScholarshipDiscoveryService } from "../services/ScholarshipDiscoveryService.js";
import { ScholarshipSourceRepository } from "../repositories/ScholarshipSourceRepository.js";
import { ScholarshipRepository } from "../repositories/ScholarshipRepository.js";
import { MatchingService } from "../services/MatchingService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../errors/AppError.js";

export class ScholarshipController {
    /**
     * Manually triggers the scholarship discovery pipeline.
     */
    static triggerDiscovery = catchAsync(async (req: Request, res: Response) => {
        // Run in background to avoid timeout
        ScholarshipDiscoveryService.discoverAll();

        res.status(200).json({
            status: "success",
            message: "Scholarship discovery process started in the background."
        });
    });

    /**
     * Gets all configured scholarship sources.
     */
    static getSources = catchAsync(async (req: Request, res: Response) => {
        const sources = await ScholarshipSourceRepository.findAllActive();
        res.status(200).json({
            status: "success",
            data: sources
        });
    });

    /**
     * Gets matched scholarships for the logged-in student.
     */
    static async getMatches(req: Request, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: "Unauthorized. User ID missing." });
            }

            const matches = await MatchingService.getTopMatches(req.user.id);
            res.status(200).json(matches);
        } catch (error: any) {
            console.error("Error fetching scholarship matches:", error.message);

            if (error.message.includes("onboarded")) {
                return res.status(403).json({ message: error.message });
            }
            if (error.message.includes("not found")) {
                return res.status(404).json({ message: error.message });
            }

            res.status(500).json({ message: "Internal server error while matching scholarships." });
        }
    }

    /**
     * Gets a single scholarship with matching details.
     */
    static getDetails = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) throw new AppError("Unauthorized", 401);

        const scholarship = await MatchingService.getMatchById(userId, parseInt(id as string));

        if (!scholarship) {
            throw new AppError("Scholarship not found", 404);
        }

        res.status(200).json({
            status: "success",
            data: scholarship
        });
    });

    /**
     * Lists scholarships with general filters (Explorer).
     */
    static list = catchAsync(async (req: Request, res: Response) => {
        const filters = req.query;
        const scholarships = await ScholarshipRepository.findAll(filters);
        
        res.status(200).json({
            status: "success",
            data: scholarships
        });
    });
}
