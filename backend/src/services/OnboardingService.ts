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
import { AuthService } from "./AuthService.js";


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

            const updateFields: any = {
                isOnboarded: true
            };

            if (updateData.gpa !== undefined || updateData.calculatedGpa !== undefined) updateFields.calculatedGpa = updateData.gpa || updateData.calculatedGpa;
            if (updateData.academicHistory !== undefined) updateFields.academicHistory = typeof updateData.academicHistory === 'string' ? updateData.academicHistory : JSON.stringify(updateData.academicHistory);
            if (updateData.studyPreferences !== undefined) updateFields.studyPreferences = updateData.studyPreferences;
            if (updateData.intakeSeason !== undefined) updateFields.intakeSeason = updateData.intakeSeason;
            if (updateData.fundingRequirement !== undefined || updateData.preferredFundingType !== undefined) {
                const fundingVal = updateData.preferredFundingType || updateData.fundingRequirement;
                updateFields.fundingRequirement = Array.isArray(fundingVal) 
                    ? JSON.stringify(fundingVal) 
                    : fundingVal;
            }
            if (updateData.gender !== undefined) updateFields.gender = updateData.gender;
            if (updateData.age !== undefined) updateFields.age = updateData.age;
            if (updateData.workExperience !== undefined) updateFields.workExperience = typeof updateData.workExperience === 'string' ? updateData.workExperience : JSON.stringify(updateData.workExperience);
            if (updateData.countryInterest !== undefined) updateFields.countryInterest = updateData.countryInterest;
            if (updateData.highSchool !== undefined) updateFields.highSchool = updateData.highSchool;
            if (updateData.currentEducationLevel !== undefined || updateData.academicStatus !== undefined) updateFields.academicStatus = updateData.currentEducationLevel || updateData.academicStatus;
            if (updateData.dateOfBirth !== undefined) updateFields.dateOfBirth = updateData.dateOfBirth;
            if (updateData.nationality !== undefined) updateFields.nationality = updateData.nationality;
            if (updateData.countryOfResidence !== undefined) updateFields.countryOfResidence = updateData.countryOfResidence;
            if (updateData.city !== undefined) updateFields.city = updateData.city;
            if (updateData.phoneNumber !== undefined) updateFields.phoneNumber = updateData.phoneNumber;
            if (updateData.fieldOfStudyInput !== undefined || updateData.fieldOfStudy !== undefined) updateFields.fieldOfStudy = updateData.fieldOfStudyInput ? (typeof updateData.fieldOfStudyInput === 'string' ? updateData.fieldOfStudyInput : JSON.stringify(updateData.fieldOfStudyInput)) : updateData.fieldOfStudy;
            if (updateData.currentUniversity !== undefined || updateData.previousUniversity !== undefined) updateFields.currentUniversity = updateData.currentUniversity || updateData.previousUniversity;
            if (updateData.graduationYear !== undefined) updateFields.graduationYear = !isNaN(parseInt(updateData.graduationYear as string)) ? parseInt(updateData.graduationYear as string) : null;
            if (updateData.degreeSeeking !== undefined) updateFields.degreeSeeking = updateData.degreeSeeking;
            if (updateData.preferredDegreeLevel !== undefined) updateFields.preferredDegreeLevel = typeof updateData.preferredDegreeLevel === 'string' ? updateData.preferredDegreeLevel : JSON.stringify(updateData.preferredDegreeLevel);
            if (updateData.studyMode !== undefined) updateFields.studyMode = updateData.studyMode;
            if (updateData.preferredCountries !== undefined) updateFields.preferredCountries = typeof updateData.preferredCountries === 'string' ? updateData.preferredCountries : JSON.stringify(updateData.preferredCountries);
            if (updateData.preferredUniversities !== undefined) updateFields.preferredUniversities = typeof updateData.preferredUniversities === 'string' ? updateData.preferredUniversities : JSON.stringify(updateData.preferredUniversities);
            if (updateData.languageTestType !== undefined) updateFields.languageTestType = updateData.languageTestType;
            if (updateData.languageScore !== undefined) updateFields.languageScore = updateData.languageScore;
            if (updateData.needsFinancialSupport !== undefined) updateFields.needsFinancialSupport = (updateData.needsFinancialSupport === 'true' || updateData.needsFinancialSupport === true);
            if (updateData.familyIncomeRange !== undefined) updateFields.familyIncomeRange = updateData.familyIncomeRange;
            if (updateData.researchArea !== undefined) updateFields.researchArea = updateData.researchArea;
            if (updateData.proposedResearchTopic !== undefined) updateFields.proposedResearchTopic = updateData.proposedResearchTopic;

            if (cvUrl) updateFields.cvUrl = cvUrl;
            if (transcriptUrl) updateFields.transcriptUrl = transcriptUrl;
            if (degreeCertificateUrl) updateFields.degreeCertificateUrl = degreeCertificateUrl;
            if (languageCertificateUrl) updateFields.languageCertificateUrl = languageCertificateUrl;

            const updatedStudent = await repository.update(userId, updateFields);

            // Handle Avatar Upload outside of student repository update if it's on the User model
            if (files && files.avatar) {
                const avatarUrl = await FileService.uploadFile(files.avatar.data, "profiles/avatars");
                await UserRepository.update(userId, { avatarUrl } as any);
            }

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

        return AuthService.getUserWithProfile(user);
    }
}
