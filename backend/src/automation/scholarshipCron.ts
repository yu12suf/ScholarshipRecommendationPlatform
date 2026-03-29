import cron from "node-cron";
import { ScholarshipDiscoveryService } from "../services/ScholarshipDiscoveryService.js";
import { DeadlineReminderService } from "../services/DeadlineReminderService.js";

export const startScholarshipCron = () => {
    // Schedule task to run every 6 hours
    // cron.schedule("0 */6 * * *", async () => {
    //     console.log("Running scheduled scholarship discovery...");
    //     await ScholarshipDiscoveryService.discoverAll();
    // });

    // Schedule deadline reminders to run every hour
    cron.schedule("0 * * * *", async () => {
        console.log("Running scheduled deadline reminder check...");
        await DeadlineReminderService.checkAndSendReminders();
    });

    console.log("Scholarship discovery job and deadline reminders scheduled.");
};
