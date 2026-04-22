import { UserRepository } from "../repositories/UserRepository.js";
import { StudentRepository } from "../repositories/StudentRepository.js";
import { CounselorRepository } from "../repositories/CounselorRepository.js";
import { CreateUserDto, UpdateUserDto, UserRole } from "../types/userTypes.js";
import { User } from "../models/User.js";

export class UserService {
  static async createUser(userData: CreateUserDto): Promise<User> {
    const user = await UserRepository.create(userData);

    if (user.role === UserRole.STUDENT) {
      await StudentRepository.create({ userId: user.id });
    } else if (user.role === UserRole.COUNSELOR) {
      await CounselorRepository.create({ userId: user.id });
    }

    return user;
  }

  static async getProfile(userId: number): Promise<User | null> {
    return UserRepository.findById(userId);
  }

  static async updateProfile(
    userId: number,
    updates: any,
  ): Promise<User | null> {
    // 1. Update User core fields (name, email, etc.)
    const userUpdates: UpdateUserDto = {};
    if (updates.name) userUpdates.name = updates.name;
    // Add other user fields if necessary, but be careful not to allow role changes here if not admin

    await UserRepository.update(userId, userUpdates);

    // 2. Fetch the user to check role
    const user = await UserRepository.findById(userId);
    if (!user) return null;

    // 3. Delegate to role-specific repositories
    if (user.role === UserRole.STUDENT) {
      await StudentRepository.update(userId, {
        documentUrl: updates.documentUrl,
        cvUrl: updates.cvUrl,
        transcriptUrl: updates.transcriptUrl,
        degreeCertificateUrl: updates.degreeCertificateUrl,
        languageCertificateUrl: updates.languageCertificateUrl,

        calculatedGpa: updates.calculatedGpa || updates.gpa,
        academicHistory: updates.academicHistory
          ? typeof updates.academicHistory === "string"
            ? updates.academicHistory
            : JSON.stringify(updates.academicHistory)
          : undefined,
        studyPreferences: updates.studyPreferences,
        extractedData: updates.extractedData
          ? typeof updates.extractedData === "string"
            ? updates.extractedData
            : JSON.stringify(updates.extractedData)
          : undefined,
        idMatchConfidence: updates.idMatchConfidence,
        identityVerified: updates.identityVerified,
        isOnboarded: true, // Mark as onboarded on update? Or only if explicit? Let's assume updates might complete profile.

        // Additional matching fields
        intakeSeason: updates.intakeSeason,
        fundingRequirement:
          updates.fundingRequirement || updates.preferredFundingType,
        gender: updates.gender,
        age: updates.age,
        workExperience: updates.workExperience
          ? typeof updates.workExperience === "string"
            ? updates.workExperience
            : JSON.stringify(updates.workExperience)
          : undefined,
        countryInterest: updates.countryInterest,
        highSchool: updates.highSchool,
        academicStatus: updates.academicStatus || updates.currentEducationLevel,

        dateOfBirth: updates.dateOfBirth,
        nationality: updates.nationality,
        countryOfResidence: updates.countryOfResidence,
        city: updates.city,
        phoneNumber: updates.phoneNumber,

        fieldOfStudy: updates.fieldOfStudy || updates.fieldOfStudyInput,
        currentUniversity:
          updates.currentUniversity || updates.previousUniversity,
        graduationYear: updates.graduationYear,
        degreeSeeking: updates.degreeSeeking,

        preferredDegreeLevel: updates.preferredDegreeLevel,
        studyMode: updates.studyMode,
        preferredCountries: updates.preferredCountries,
        preferredUniversities: updates.preferredUniversities,

        needsFinancialSupport: updates.needsFinancialSupport,
        familyIncomeRange: updates.familyIncomeRange,
        researchArea: updates.researchArea,
        proposedResearchTopic: updates.proposedResearchTopic,
        notificationPreferences: updates.notificationPreferences,
      });
    } else if (user.role === UserRole.COUNSELOR) {
      await CounselorRepository.update(userId, {
        bio: updates.bio,
        areasOfExpertise: updates.areasOfExpertise,
        yearsOfExperience: updates.yearsOfExperience,
        isOnboarded: updates.isOnboarded,
      });
    }

    // Return updated user
    return UserRepository.findById(userId);
  }

  static async getAllUsers(limit: number, offset: number): Promise<User[]> {
    return UserRepository.findAll(limit, offset);
  }

  static async getUserById(id: number): Promise<User | null> {
    return UserRepository.findById(id);
  }

  static async getUsersByRole(role: UserRole): Promise<User[]> {
    return UserRepository.findByRole(role);
  }

  static async updateUserRole(
    id: number,
    role: UserRole,
  ): Promise<User | null> {
    return UserRepository.update(id, { role });
  }

  static async deactivateUser(id: number): Promise<User | null> {
    return UserRepository.update(id, { isActive: false });
  }

  static async activateUser(id: number): Promise<User | null> {
    return UserRepository.update(id, { isActive: true });
  }

  static async deleteUser(id: number): Promise<boolean> {
    return UserRepository.delete(id);
  }

  static async getAdminStats() {
    const totalUsers = await UserRepository.countAll();
    const students = await UserRepository.countByRole(UserRole.STUDENT);
    const counselors = await UserRepository.countByRole(UserRole.COUNSELOR);
    const admins = await UserRepository.countByRole(UserRole.ADMIN);

    return {
      totalUsers,
      students,
      counselors,
      admins,
    };
  }
}
