import { Router } from "express";
import { OnboardingController } from "../controller/OnboardingController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * @route POST /api/onboarding/extract
 * @desc Stage 1: Intelligence Extraction from Transcript/CV
 * @access Private
 */
router.post("/extract", authenticate, OnboardingController.extractData);

/**
 * @route POST /api/onboarding/verify-identity
 * @desc Stage 2: Biometric Identity Matching (Face-to-ID)
 * @access Private
 */
router.post("/verify-identity", authenticate, OnboardingController.verifyIdentity);

/**
 * @route POST /api/onboarding/update-profile
 * @desc Stage 3: Update Profile and Complete Onboarding
 * @access Private
 */
router.put("/update-profile", authenticate, OnboardingController.updateProfile);

export default router;
