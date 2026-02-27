import { StudentRepository } from "../repositories/StudentRepository.js";
import { CounselorRepository } from "../repositories/CounselorRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { UserRole } from "../types/userTypes.js";
import { AIService } from "./AIService.js";
import { IdentityService } from "./IdentityService.js";
import { FileService } from "./FileService.js";
import { VectorService } from "./VectorService.js";

export class OnboardingService {
    /**
     * Stage 1: Intelligence Extraction from Transcript/CV Image
     */
    static async extractData(userId: number, role: string, fileBuffer: Buffer, mimeType: string) {
        // 1. Upload to Cloudinary
        const documentUrl = await FileService.uploadFile(fileBuffer, `onboarding/${role}s`);

        // 2. Perform Vision extraction
        const extractedData = await AIService.extractOnboardingData(fileBuffer, mimeType, role);

        let repository: any;
        if (role === UserRole.STUDENT) {
            repository = StudentRepository;
        } else if (role === UserRole.COUNSELOR) {
            repository = CounselorRepository;
        }

        if (!repository) throw new Error(`Invalid role: ${role}`);

        const instance = await repository.findByUserId(userId);
        if (!instance) throw new Error(`${role} record not found for user`);

        // 3. Update repository with both URL and extracted JSON
        await repository.update(userId, {
            documentUrl,
            extractedData: JSON.stringify(extractedData)
        });

        return {
            documentUrl,
            extractedData
        };
    }

    /**
     * Stage 2: Biometric Identity Matching
     */
    static async verifyIdentity(userId: number, idCardBuffer: Buffer, selfieBuffer: Buffer) {
        return IdentityService.performBiometricCheck(userId, idCardBuffer, selfieBuffer);
    }

    /**
     * Stage 3: Update Profile and Complete Onboarding
     */
    static async updateProfile(userId: number, updateData: any) {
        const user = await UserRepository.findById(userId);
        if (!user) throw new Error("User not found");

        let repository: any;
        if (user.role === UserRole.STUDENT) {
            repository = StudentRepository;
        } else if (user.role === UserRole.COUNSELOR) {
            repository = CounselorRepository;
        }

        if (!repository) throw new Error(`Invalid role: ${user.role}`);

        const instance = await repository.findByUserId(userId);
        if (!instance) throw new Error(`${user.role} record not found for user`);

        if (user.role === UserRole.STUDENT) {
            const updatedStudent = await repository.update(userId, {
                calculatedGpa: updateData.calculatedGpa ?? null,
                academicHistory: updateData.academicHistory ? JSON.stringify(updateData.academicHistory) : "[]",
                studyPreferences: updateData.studyPreferences || "",
                intakeSeason: updateData.intakeSeason || null,
                fundingRequirement: updateData.fundingRequirement || null,
                ieltsScore: updateData.ieltsScore || null,
                toeflScore: updateData.toeflScore || null,
                duolingoScore: updateData.duolingoScore || null,
                gender: updateData.gender || null,
                age: updateData.age || null,
                workExperience: updateData.workExperience || null,
                countryInterest: updateData.countryInterest || null,
                highSchool: updateData.highSchool || null,
                academicStatus: updateData.academicStatus || null,
                isOnboarded: true
            });

            // Refresh embedding immediately after onboarding/update
            if (updatedStudent) {
                await VectorService.generateStudentEmbedding(updatedStudent);
            }
        } else if (user.role === UserRole.COUNSELOR) {
            await repository.update(userId, {
                bio: updateData.bio || "",
                areasOfExpertise: updateData.areasOfExpertise ? JSON.stringify(updateData.areasOfExpertise) : "[]",
                yearsOfExperience: updateData.yearsOfExperience || 0,
                isOnboarded: true
            });
        }

        return { role: user.role };
    }
}
