import { Router } from "express";
import { VisaController } from "../controller/VisaController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/guidelines/:country", authenticate, VisaController.getGuidelines);
router.post("/initiate-call", authenticate, VisaController.initiateCall);
router.get("/status/:id", authenticate, VisaController.getInterviewStatus);
router.get("/analysis/:id", authenticate, VisaController.getInterviewAnalysis);
router.post("/finalize/:id", authenticate, VisaController.finalizeInterview);

// Webhook for Vapi is public (Vapi server calls it)
router.post("/webhook/vapi", VisaController.handleWebhook);

export default router;
