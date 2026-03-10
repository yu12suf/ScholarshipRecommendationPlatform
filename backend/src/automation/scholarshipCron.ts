import cron from "node-cron";
import { ScholarshipDiscoveryService } from "../services/ScholarshipDiscoveryService.js";

export const startScholarshipCron = () => {
  // Schedule task to run every 5 minutes
  cron.schedule("*/1 * * * *", async () => {
    console.log("Running scheduled scholarship discovery...");
    await ScholarshipDiscoveryService.discoverAll();
  });

  console.log("Scholarship discovery job scheduled (every 5 minutes).");
};
