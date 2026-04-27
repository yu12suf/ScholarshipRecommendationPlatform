import cron from "node-cron";
import { ScholarshipDiscoveryService } from "../services/ScholarshipDiscoveryService.js";
import { DeadlineReminderService } from "../services/DeadlineReminderService.js";
import { SettlementService } from "../services/SettlementService.js";

export const startScholarshipCron = () => {
  // Schedule task to run every 5 minutes (or 1 minute for testing)
  cron.schedule("*/1 * * * *", async () => {
    console.log("Running scheduled scholarship discovery...");
    await ScholarshipDiscoveryService.discoverAll();
    
    // Also run settlement check briefly or on a different schedule
    console.log("Running scheduled escrow auto-release check...");
    await SettlementService.autoReleaseEscrow();
  });

  // Schedule deadline reminders to run every hour
  cron.schedule("0 * * * *", async () => {
      console.log("Running scheduled deadline reminder check...");
      await DeadlineReminderService.checkAndSendReminders();
  });

  console.log("Scholarship discovery job and deadline reminders scheduled.");
};
