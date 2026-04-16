import { Router } from "express";
import { VisaController } from "../controller/VisaController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/guidelines/:country", authenticate, VisaController.getGuidelines);
router.post("/initiate-call", authenticate, VisaController.initiateCall);
router.post("/transcribe", authenticate, VisaController.transcribeAudio);
router.post("/chat", authenticate, VisaController.chatResponse);
router.get("/analysis/:id", authenticate, VisaController.getInterviewAnalysis);
router.post("/finalize/:id", authenticate, VisaController.finalizeInterview);

export default router;
