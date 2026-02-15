import { AIService } from "./AIService.js";
import { StudentRepository } from "../repositories/StudentRepository.js";
import { CounselorRepository } from "../repositories/CounselorRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { UserRole } from "../types/userTypes.js";
import { FileService } from "./FileService.js";

export class IdentityService {
    /**
     * Orchestrates identity verification check.
     */
    static async performBiometricCheck(userId: number, idCardBuffer: Buffer, selfieBuffer: Buffer) {
        // 1. Upload both to Cloudinary for permanent storage
        const idCardUrl = await FileService.uploadFile(idCardBuffer, "identity/id_cards");
        const selfieUrl = await FileService.uploadFile(selfieBuffer, "identity/selfies");

        // 2. Perform AI verification using buffers
        const result = await AIService.verifyIdentity(idCardBuffer, selfieBuffer);

        const isVerified = result.confidence_score > 0.8;

        const user = await UserRepository.findById(userId);
        if (!user) throw new Error("User not found");

        let repository: any;
        if (user.role === UserRole.STUDENT) {
            repository = StudentRepository;
        } else if (user.role === UserRole.COUNSELOR) {
            repository = CounselorRepository;
        }

        if (!repository) throw new Error(`Invalid role for identity verification: ${user.role}`);

        const instance = await repository.findByUserId(userId);
        if (!instance) throw new Error(`${user.role} record not found for user`);

        const currentData = instance.extractedData ? JSON.parse(instance.extractedData) : {};

        await repository.update(userId, {
            idCardUrl,
            selfieUrl,
            idMatchConfidence: result.confidence_score,
            identityVerified: isVerified,
            extractedData: JSON.stringify({
                ...currentData,
                identity: {
                    fullName: result.full_name,
                    dob: result.dob
                }
            })
        });

        return {
            success: isVerified,
            confidenceScore: result.confidence_score,
            extractedIdentity: {
                fullName: result.full_name,
                dob: result.dob
            }
        };
    }
}
