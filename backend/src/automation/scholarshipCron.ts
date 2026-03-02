import cron from "node-cron";
import { ScholarshipDiscoveryService } from "../services/ScholarshipDiscoveryService.js";

export const startScholarshipCron = () => {
    // Schedule task to run every 5 minutes for testing
    // " * * * *" means every 5th minute
    
    cron.schedule("0 */6 * * *", async () => {
        console.log("Running scheduled scholarship discovery...");
        await ScholarshipDiscoveryService.discoverAll();
    });
    

    console.log("Scholarship discovery job scheduled (every 5 minutes for testing).");
};
