import cron from "node-cron";
import { ScholarshipDiscoveryService } from "../services/ScholarshipDiscoveryService.js";

export const startScholarshipCron = () => {
    // Schedule task to run every 5 minutes for testing
    // "*/5 * * * *" means every 5th minute
    cron.schedule("*/5 * * * *", async () => {
        console.log("Running scheduled scholarship discovery...");
        await ScholarshipDiscoveryService.discoverAll();
    });

    console.log("Scholarship discovery job scheduled (every 5 minutes for testing).");
};
