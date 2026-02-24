import express from "express";
import { ScholarshipController } from "../controller/ScholarshipController.js";
// import { protect, adminOnly } from "../../../middlewares/authMiddleware.js"; // Assume these exist or add later

const router = express.Router();

// Define routes
router.post("/trigger-discovery", ScholarshipController.triggerDiscovery);
router.get("/sources", ScholarshipController.getSources);

export default router;
