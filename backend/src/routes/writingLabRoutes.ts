import { Router } from "express";
import { WritingLabController } from "../controller/WritingLabController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

// Evaluate an essay
router.post("/evaluate", authenticate, WritingLabController.evaluate);

export default router;
