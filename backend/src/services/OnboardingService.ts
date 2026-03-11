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
    static async updateProfile(userId: number, updateData: any, files?: { [key: string]: any }) {
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
            // Handle file uploads if any
            let cvUrl = instance.cvUrl;
            let transcriptUrl = instance.transcriptUrl;
            let certificateUrl = instance.certificateUrl;

            if (files) {
                if (files.cv) cvUrl = await FileService.uploadFile(files.cv.data, "documents/cvs");
                if (files.transcript) transcriptUrl = await FileService.uploadFile(files.transcript.data, "documents/transcripts");
                if (files.certificate) certificateUrl = await FileService.uploadFile(files.certificate.data, "documents/certificates");
            }

            if (updateData.fullName) {
                await UserRepository.update(userId, { name: updateData.fullName } as any);
            }

            const updatedStudent = await repository.update(userId, {
                calculatedGpa: updateData.gpa ?? updateData.calculatedGpa ?? null,
                academicHistory: updateData.academicHistory ? (typeof updateData.academicHistory === 'string' ? updateData.academicHistory : JSON.stringify(updateData.academicHistory)) : "[]",
                studyPreferences: updateData.studyPreferences || "",
                intakeSeason: updateData.intakeSeason || null,
                fundingRequirement: updateData.preferredFundingType || updateData.fundingType || updateData.fundingRequirement || null,
                ieltsScore: updateData.ieltsScore || null,
                toeflScore: updateData.toeflScore || null,
                duolingoScore: updateData.duolingoScore || null,
                gender: updateData.gender || null,
                age: updateData.age || null,
                workExperience: updateData.workExperience ? (typeof updateData.workExperience === 'string' ? updateData.workExperience : JSON.stringify(updateData.workExperience)) : null,
                countryInterest: updateData.countryInterest || null,
                highSchool: updateData.highSchool || null,
                academicStatus: updateData.currentEducationLevel || updateData.academicStatus || null,
                
                // New Fields from the Profile Form
                dateOfBirth: updateData.dateOfBirth || null,
                nationality: updateData.nationality || null,
                countryOfResidence: updateData.countryOfResidence || null,
                city: updateData.city || null,
                phoneNumber: updateData.phoneNumber || null,
                fieldOfStudy: updateData.fieldOfStudyInput ? JSON.stringify(updateData.fieldOfStudyInput) : (updateData.fieldOfStudy || null),
                currentUniversity: updateData.currentUniversity || updateData.previousUniversity || null,
                graduationYear: updateData.graduationYear ? parseInt(updateData.graduationYear as string) : null,
                degreeSeeking: updateData.degreeSeeking || null,
                preferredCountries: updateData.preferredCountries ? (typeof updateData.preferredCountries === 'string' ? updateData.preferredCountries : JSON.stringify(updateData.preferredCountries)) : null,
                preferredUniversities: updateData.preferredUniversities ? (typeof updateData.preferredUniversities === 'string' ? updateData.preferredUniversities : JSON.stringify(updateData.preferredUniversities)) : null,
                languageTestType: updateData.languageTestType || updateData.languageQualification?.testType || null,
                languageScore: updateData.testScore || updateData.languageQualification?.score || null,
                needsFinancialSupport: updateData.needsFinancialSupport ?? updateData.financialNeed?.needsSupport ?? null,
                familyIncomeRange: updateData.familyIncomeRange || updateData.financialNeed?.familyIncomeRange || null,
                researchArea: updateData.researchArea || updateData.researchInterest?.researchArea || null,
                proposedResearchTopic: updateData.proposedResearchTopic || updateData.researchInterest?.proposedTopic || null,
                notificationPreferences: updateData.notifications ? JSON.stringify(updateData.notifications) : (updateData.notificationPreferences ? (typeof updateData.notificationPreferences === 'string' ? updateData.notificationPreferences : JSON.stringify(updateData.notificationPreferences)) : null),
                
                // Document URLs
                cvUrl,
                transcriptUrl,
                certificateUrl,

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
