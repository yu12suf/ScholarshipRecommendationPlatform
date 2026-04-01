import { Router } from "express";
import { LearningPathController } from "../controller/LearningPathController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/my-path", authenticate, LearningPathController.getMyPath);
router.post("/track", authenticate, LearningPathController.markComplete);

export default router;
