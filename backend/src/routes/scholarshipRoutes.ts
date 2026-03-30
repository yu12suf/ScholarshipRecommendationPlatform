import express from "express";
import { ScholarshipController } from "../controller/ScholarshipController.js";
import { ScholarshipTrackingController } from "../controller/ScholarshipTrackingController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Define routes
router.post("/trigger-discovery", ScholarshipController.triggerDiscovery);
router.get("/sources", ScholarshipController.getSources);
router.get("/match", authenticate, ScholarshipController.getMatches);

// Tracking & Deadline Management
router.post("/track/:scholarshipId", authenticate, ScholarshipTrackingController.track);
router.get("/tracked", authenticate, ScholarshipTrackingController.getWatchlist);
router.patch("/track/deadline/:id", authenticate, ScholarshipTrackingController.updateDeadline);
router.patch("/track/status/:id", authenticate, ScholarshipTrackingController.updateStatus);
router.patch("/track/notification-settings/:id", authenticate, ScholarshipTrackingController.updateNotificationSettings);
router.post("/track/milestones/:id", authenticate, ScholarshipTrackingController.addMilestone);
router.patch("/track/milestones/toggle/:milestoneId", authenticate, ScholarshipTrackingController.toggleMilestone);
router.get("/calendar", authenticate, ScholarshipTrackingController.getCalendar);

export default router;
