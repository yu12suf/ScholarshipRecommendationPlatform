import express from "express";
import { ScholarshipController } from "../controller/ScholarshipController.js";
import { ScholarshipTrackingController } from "../controller/ScholarshipTrackingController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Define routes
router.post("/trigger-discovery", ScholarshipController.triggerDiscovery);
router.get("/sources", ScholarshipController.getSources);
router.get("/match", authenticate, ScholarshipController.getMatches);

// Static paths must be registered before `/:id` so they are not parsed as IDs.

router.get("/calendar", authenticate, ScholarshipTrackingController.getCalendar);

// Tracking & Deadline Management
router.post("/track/:scholarshipId", authenticate, ScholarshipTrackingController.track);
router.get("/tracked", authenticate, ScholarshipTrackingController.getWatchlist);
router.get("/dashboard/stats", authenticate, ScholarshipTrackingController.getDashboardStats);
router.patch("/track/deadline/:id", authenticate, ScholarshipTrackingController.updateDeadline);
router.patch("/track/status/:id", authenticate, ScholarshipTrackingController.updateStatus);
router.patch("/track/notification-settings/:id", authenticate, ScholarshipTrackingController.updateNotificationSettings);
router.post("/track/milestones/:id", authenticate, ScholarshipTrackingController.addMilestone);
router.patch("/track/milestones/toggle/:milestoneId", authenticate, ScholarshipTrackingController.toggleMilestone);

router.get("/:id", authenticate, ScholarshipController.getDetails);

export default router;
