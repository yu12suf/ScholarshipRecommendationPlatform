"use client";

import { StudentProfileForm } from "@/features/student/components/profile-form/StudentProfileForm";
import { useAuth } from "@/providers/auth-context";
import { toast } from "react-hot-toast";
import { updateProfile } from "@/features/onboarding/api/onboarding-api";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api";
import { ProfileFormValues } from "@/features/student/lib/profile-schema";

export default function StudentProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile(data);
      updateUser({ ...user, ...data, isOnboarded: true });
      toast.success("Profile saved");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save profile"));
    }
  };

  const mapUserToFormValues = (userData: any): Partial<ProfileFormValues> => {
    if (!userData) return {};
    
    const safeParse = (str: any, defaultVal: any = []) => {
      if (!str) return defaultVal;
      try {
        return typeof str === "string" ? JSON.parse(str) : str;
      } catch {
        return defaultVal;
      }
    };

    return {
      fullName: userData.name || "",
      email: userData.email || "",
      phoneNumber: userData.phoneNumber || "",
      dateOfBirth: userData.dateOfBirth || "",
      gender: userData.gender || "",
      nationality: userData.nationality || "",
      countryOfResidence: userData.countryOfResidence || "",
      city: userData.city || "",
      currentEducationLevel: userData.academicStatus || userData.currentEducationLevel || "",
      degreeSeeking: userData.degreeSeeking || "",
      fieldOfStudyInput: safeParse(userData.fieldOfStudy, []),
      previousUniversity: userData.currentUniversity || "",
      graduationYear: userData.graduationYear || undefined,
      gpa: userData.calculatedGpa || undefined,
      languageTestType: userData.languageTestType || "None",
      testScore: userData.languageScore || "",
      researchArea: userData.researchArea || "",
      preferredFundingType: userData.fundingRequirement || "",
      preferredCountries: safeParse(userData.preferredCountries, []),
      preferredUniversities: safeParse(userData.preferredUniversities, []),
      workExperience: safeParse(userData.workExperience, []),
      familyIncomeRange: userData.familyIncomeRange || "",
      needsFinancialSupport: userData.needsFinancialSupport || false,
      notifications: safeParse(userData.notificationPreferences, { email: true, sms: false, inSystem: true }),
    } as any;
  };

  return (
    <div className="bg-background min-h-screen">
      <StudentProfileForm 
        onSubmit={handleSubmit} 
        initialData={mapUserToFormValues(user)}
      />
    </div>
  );
}
