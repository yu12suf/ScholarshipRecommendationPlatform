import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { OnboardingService } from "../services/OnboardingService.js";
import { OCRService } from "../services/OCRService.js";
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
     * Extract profile data from document for pre-filling form fields
     * This endpoint is called when user uploads a document on the profile form
     */
    static extractProfileData = catchAsync(async (req: Request, res: Response) => {
        if (!req.files || !req.files.document) {
            throw new AppError("document file is required", 400);
        }

        const documentFile = (Array.isArray(req.files.document)
            ? req.files.document[0]
            : req.files.document) as UploadedFile;

        const mimeType = documentFile.mimetype;

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ];

        if (!allowedTypes.includes(mimeType)) {
            throw new AppError("Invalid file type. Supported: PDF, DOCX, JPEG, PNG, GIF, WebP", 400);
        }

        console.log("[OnboardingController] Extracting profile data from document, type:", mimeType, "size:", documentFile.size);

        // Extract data using OCR Service (with automatic retries)
        const extractedData = await OCRService.extractProfileFromDocument(
            documentFile.data,
            mimeType
        );

        console.log("[OnboardingController] Extracted data:", JSON.stringify(extractedData, null, 2));

        // Check if extraction was successful (confidence > 0 means some data was extracted)
        const hasData = extractedData.confidence > 0 && Object.keys(extractedData.personalInfo || {}).length > 0;

        // Convert to profile form values format
        const profileFormValues = OCRService.toProfileFormValues(extractedData);

        console.log("[OnboardingController] Profile form values:", JSON.stringify(profileFormValues, null, 2));

        // Count all non-empty values (including arrays with items)
        const extractedFieldsCount = Object.entries(profileFormValues).filter(([key, value]) => {
            if (value === undefined || value === null) return false;
            if (typeof value === 'string' && value === '') return false;
            if (Array.isArray(value) && value.length === 0) return false;
            if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                const entries = Object.values(value as object);
                return entries.some(v => v !== undefined && v !== null && v !== '');
            }
            return true;
        }).length;

        console.log("[OnboardingController] Extracted fields count:", extractedFieldsCount);

        res.status(200).json({
            status: "success",
            message: hasData ? "Profile data extracted successfully" : "Could not extract data. Please try again with a clearer document.",
            data: {
                extractedData,
                profileFormValues,
                confidence: extractedData.confidence,
                extractedFields: extractedFieldsCount,
                success: hasData
            }
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
        
        // Handle optional file uploads - files are NOT required for profile update
        if (req.files) {
            const possibleFiles = ['cv', 'transcript', 'certificate', 'degreeCertificate', 'languageCertificate'];
            possibleFiles.forEach(key => {
                const file = req.files![key];
                if (file) {
                    const uploadedFile = Array.isArray(file) ? file[0] : file;
                    // Only include file if it has actual data (not empty)
                    if (uploadedFile && uploadedFile.data && uploadedFile.data.length > 0) {
                        files[key] = uploadedFile as UploadedFile;
                    }
                }
            });
        }

        console.log("[OnboardingController] Updating profile for user:", userId, "with files:", Object.keys(files));

        const result = await OnboardingService.updateProfile(userId, req.body, Object.keys(files).length > 0 ? files : undefined);

        res.status(200).json({
            status: "success",
            message: "Profile updated and onboarding complete",
            data: { role: result.role }
        });
    });
}
