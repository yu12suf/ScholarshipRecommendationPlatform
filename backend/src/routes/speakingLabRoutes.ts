import { Router } from "express";
import { SpeakingLabController } from "../controller/SpeakingLabController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/evaluate", authenticate, SpeakingLabController.evaluate);

export default router;
