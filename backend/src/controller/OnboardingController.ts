import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { OnboardingService } from "../services/OnboardingService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../errors/AppError.js";

export class OnboardingController {
    /**
     * Stage 1: Intelligence Extraction from Transcript/CV Image
     */
    static extractData = catchAsync(async (req: Request, res: Response) => {
        const { role } = req.body;
        const userId = (req as any).user?.id;

        if (!role) throw new AppError("role is required", 400);

        if (!req.files || !req.files.document) {
            throw new AppError("document file is required", 400);
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
            status: "success",
            message: "Document uploaded and data extracted",
            ...result
        });
    });

    /**
     * Stage 2: Biometric Identity Matching
     */
    static verifyIdentity = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;

        if (!req.files || !req.files.idCard || !req.files.selfie) {
            throw new AppError("idCard and selfie files are required", 400);
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
            status: result.success ? "success" : "fail",
            message: result.success ? "Identity verified successfully" : "Identity verification failed",
            data: result
        });
    });

    /**
     * Stage 3: Update Profile and Complete Onboarding
     */
    static updateProfile = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;
        
        const files: { [key: string]: UploadedFile } = {};
        if (req.files) {
            const possibleFiles = ['cv', 'transcript', 'certificate', 'degreeCertificate', 'languageCertificate'];
            possibleFiles.forEach(key => {
                if (req.files![key]) {
                    files[key] = (Array.isArray(req.files![key]) ? req.files![key][0] : req.files![key]) as UploadedFile;
                }
            });
        }

        const result = await OnboardingService.updateProfile(userId, req.body, files);

        res.status(200).json({
            status: "success",
            message: "Profile updated and onboarding complete",
            data: { role: result.role }
        });
    });
}
