import { StudentRepository } from "../repositories/StudentRepository.js";
import { CounselorRepository } from "../repositories/CounselorRepository.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { UserRole } from "../types/userTypes.js";
import { AIService } from "./AIService.js";
import { IdentityService } from "./IdentityService.js";
import { FileService } from "./FileService.js";
import { VectorService } from "./VectorService.js";
import { MatchingService } from "./MatchingService.js";
import { sendEmail } from "../utils/emailService.js";
import { ScholarshipNotificationService } from "./ScholarshipNotificationService.js";

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

        let instance = await repository.findByUserId(userId);
        if (!instance) {
            console.log(`Creating missing ${role} record for user ${userId}`);
            instance = await repository.create({ userId });
        }

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
            let degreeCertificateUrl = instance.degreeCertificateUrl;
            let languageCertificateUrl = instance.languageCertificateUrl;

            if (files) {
                if (files.cv) cvUrl = await FileService.uploadFile(files.cv.data, "documents/cvs");
                if (files.transcript) transcriptUrl = await FileService.uploadFile(files.transcript.data, "documents/transcripts");
                if (files.degreeCertificate) degreeCertificateUrl = await FileService.uploadFile(files.degreeCertificate.data, "documents/certificates/degree");
                if (files.languageCertificate) languageCertificateUrl = await FileService.uploadFile(files.languageCertificate.data, "documents/certificates/language");
            }

            if (updateData.fullName) {
                await UserRepository.update(userId, { name: updateData.fullName } as any);
            }

            const updatedStudent = await repository.update(userId, {
                calculatedGpa: updateData.gpa || updateData.calculatedGpa || null,
                academicHistory: updateData.academicHistory ? (typeof updateData.academicHistory === 'string' ? updateData.academicHistory : JSON.stringify(updateData.academicHistory)) : "[]",
                studyPreferences: updateData.studyPreferences || "",
                intakeSeason: updateData.intakeSeason || null,
                fundingRequirement: updateData.preferredFundingType || updateData.fundingType || updateData.fundingRequirement || null,
                gender: updateData.gender || null,
                age: updateData.age || null,
                workExperience: updateData.workExperience ? (typeof updateData.workExperience === 'string' ? updateData.workExperience : JSON.stringify(updateData.workExperience)) : null,
                countryInterest: updateData.countryInterest || null,
                highSchool: updateData.highSchool || null,
                academicStatus: updateData.currentEducationLevel || updateData.academicStatus || null,
                
                // Demographic Info
                dateOfBirth: updateData.dateOfBirth || null,
                nationality: updateData.nationality || null,
                countryOfResidence: updateData.countryOfResidence || null,
                city: updateData.city || null,
                phoneNumber: updateData.phoneNumber || null,
                
                // Academic Info
                fieldOfStudy: updateData.fieldOfStudyInput ? (typeof updateData.fieldOfStudyInput === 'string' ? updateData.fieldOfStudyInput : JSON.stringify(updateData.fieldOfStudyInput)) : (updateData.fieldOfStudy || null),
                currentUniversity: updateData.currentUniversity || updateData.previousUniversity || null,
                graduationYear: (updateData.graduationYear && !isNaN(parseInt(updateData.graduationYear as string))) 
                    ? parseInt(updateData.graduationYear as string) 
                    : null,
                degreeSeeking: updateData.degreeSeeking || null,
                
                // Preferences
                preferredDegreeLevel: updateData.preferredDegreeLevel ? (typeof updateData.preferredDegreeLevel === 'string' ? updateData.preferredDegreeLevel : JSON.stringify(updateData.preferredDegreeLevel)) : null,
                studyMode: updateData.studyMode || null,
                preferredCountries: updateData.preferredCountries ? (typeof updateData.preferredCountries === 'string' ? updateData.preferredCountries : JSON.stringify(updateData.preferredCountries)) : null,
                preferredUniversities: updateData.preferredUniversities ? (typeof updateData.preferredUniversities === 'string' ? updateData.preferredUniversities : JSON.stringify(updateData.preferredUniversities)) : null,
                
                // Language Qualification Mapping
                languageTestType: updateData.languageTestType || null,
                languageScore: updateData.testScore || null,
                ieltsScore: updateData.languageTestType === 'IELTS' ? (parseFloat(updateData.testScore) || null) : (updateData.ieltsScore || null),
                toeflScore: updateData.languageTestType === 'TOEFL' ? (parseInt(updateData.testScore) || null) : (updateData.toeflScore || null),
                duolingoScore: updateData.languageTestType === 'Duolingo' ? (parseInt(updateData.testScore) || null) : (updateData.duolingoScore || null),
                
                // Financial & Research
                needsFinancialSupport: (updateData.needsFinancialSupport === 'true' || updateData.needsFinancialSupport === true),
                familyIncomeRange: updateData.familyIncomeRange || null,
                researchArea: updateData.researchArea || null,
                proposedResearchTopic: updateData.proposedResearchTopic || null,
                notificationPreferences: updateData.notifications ? (typeof updateData.notifications === 'string' ? updateData.notifications : JSON.stringify(updateData.notifications)) : null,
                
                // Document URLs
                cvUrl,
                transcriptUrl,
                degreeCertificateUrl,
                languageCertificateUrl,

                isOnboarded: true
            });

            // Refresh embedding immediately after onboarding/update
            if (updatedStudent) {
                try {
                    await VectorService.generateStudentEmbedding(updatedStudent);
                } catch (err) {
                    console.error("[OnboardingService] Failed to generate student embedding:", err);
                    // Continue even if embedding fails - matching will fall back to default ranking
                }
                
                // Trigger background notification for matches
                setTimeout(async () => {
                    try {
                        const matches = await MatchingService.getTopMatches(userId);
                        if (matches.length > 0) {
                            await ScholarshipNotificationService.notifyMultipleMatches(user, updatedStudent, matches);
                        }
                    } catch (err) {
                        console.error("Background match notification failed:", err);
                    }
                }, 1000);
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
