import { Request, Response } from "express";
import { ScholarshipDiscoveryService } from "../services/ScholarshipDiscoveryService.js";
import { ScholarshipSourceRepository } from "../repositories/ScholarshipSourceRepository.js";
import { MatchingService } from "../services/MatchingService.js";

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

            if (error.message.includes("not onboarded")) {
                return res.status(403).json({ message: error.message });
            }
            if (error.message.includes("not found")) {
                return res.status(404).json({ message: error.message });
            }

            res.status(500).json({ message: "Internal server error while matching scholarships." });
        }
    }
}
