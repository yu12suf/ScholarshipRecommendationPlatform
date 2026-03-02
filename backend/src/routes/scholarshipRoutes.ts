import express from "express";
import { ScholarshipController } from "../controller/ScholarshipController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Define routes
router.post("/trigger-discovery", ScholarshipController.triggerDiscovery);
router.get("/sources", ScholarshipController.getSources);
router.get("/match", authenticate, ScholarshipController.getMatches);

export default router;
