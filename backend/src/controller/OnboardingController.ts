import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { OnboardingService } from "../services/OnboardingService.js";

export class OnboardingController {
    /**
     * Stage 1: Intelligence Extraction from Transcript/CV Image
     */
    static async extractData(req: Request, res: Response): Promise<void> {
        try {
            const { role } = req.body;
            const userId = (req as any).user?.id;

            if (!role) {
                res.status(400).json({ message: "role is required" });
                return;
            }

            if (!req.files || !req.files.document) {
                res.status(400).json({ message: "document file is required" });
                return;
            }

            const documentFile = (Array.isArray(req.files.document)
                ? req.files.document[0]
                : req.files.document) as UploadedFile;

            const result = await OnboardingService.extractData(
                userId,
                role,
                documentFile.data,
                documentFile.mimetype
            );

            res.status(200).json({
                message: "Document uploaded and data extracted",
                ...result
            });
        } catch (error: any) {
            console.error("Extraction error:", error);
            res.status(500).json({ message: "Failed to extract onboarding data", error: error.message });
        }
    }

    /**
     * Stage 2: Biometric Identity Matching
     */
    static async verifyIdentity(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;

            if (!req.files || !req.files.idCard || !req.files.selfie) {
                res.status(400).json({ message: "idCard and selfie files are required" });
                return;
            }

            const idCardFile = (Array.isArray(req.files.idCard)
                ? req.files.idCard[0]
                : req.files.idCard) as UploadedFile;

            const selfieFile = (Array.isArray(req.files.selfie)
                ? req.files.selfie[0]
                : req.files.selfie) as UploadedFile;

            const result = await OnboardingService.verifyIdentity(
                userId,
                idCardFile.data,
                selfieFile.data
            );

            res.status(200).json({
                message: result.success ? "Identity verified successfully" : "Identity verification failed",
                ...result
            });
        } catch (error: any) {
            console.error("Verification error:", error);
            res.status(500).json({ message: "Failed to verify identity", error: error.message });
        }
    }

    /**
     * Stage 3: Update Profile and Complete Onboarding
     */
    static async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            
            // Extract files if available
            const files: { [key: string]: UploadedFile } = {};
            if (req.files) {
                if (req.files.cv) files.cv = (Array.isArray(req.files.cv) ? req.files.cv[0] : req.files.cv) as UploadedFile;
                if (req.files.transcript) files.transcript = (Array.isArray(req.files.transcript) ? req.files.transcript[0] : req.files.transcript) as UploadedFile;
                if (req.files.certificate) files.certificate = (Array.isArray(req.files.certificate) ? req.files.certificate[0] : req.files.certificate) as UploadedFile;
            }

            const result = await OnboardingService.updateProfile(userId, req.body, files);

            res.status(200).json({
                message: "Profile updated and onboarding complete",
                role: result.role
            });
        } catch (error: any) {
            console.error("Update error:", error);
            res.status(500).json({ message: "Failed to update profile", error: error.message });
        }
    }
}
