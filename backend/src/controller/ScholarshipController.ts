import { Request, Response } from "express";
import { ScholarshipDiscoveryService } from "../services/ScholarshipDiscoveryService.js";
import { ScholarshipSourceRepository } from "../repositories/ScholarshipSourceRepository.js";

export class ScholarshipController {
    /**
     * Manually triggers the scholarship discovery pipeline.
     */
    static async triggerDiscovery(req: Request, res: Response) {
        try {
            // Run in background to avoid timeout
            ScholarshipDiscoveryService.discoverAll();

            res.status(200).json({
                message: "Scholarship discovery process started in the background."
            });
        } catch (error) {
            console.error("Error triggering discovery:", error);
            res.status(500).json({ message: "Failed to trigger discovery." });
        }
    }

    /**
     * Gets all configured scholarship sources.
     */
    static async getSources(req: Request, res: Response) {
        try {
            const sources = await ScholarshipSourceRepository.findAllActive();
            res.status(200).json(sources);
        } catch (error) {
            console.error("Error fetching sources:", error);
            res.status(500).json({ message: "Failed to fetch sources." });
        }
    }
}
