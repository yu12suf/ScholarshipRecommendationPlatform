"use client";

import { StudentProfileForm } from "@/features/student/components/profile-form/StudentProfileForm";
import { useAuth } from "@/providers/auth-context";
import { updateProfile } from "@/features/onboarding/api/onboarding-api";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api";
import { ProfileFormValues } from "@/features/student/lib/profile-schema";
import { getMe } from "@/features/auth/api/auth-api";
import { useEffect, useState } from "react";

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
    proposedResearchTopic: userData.proposedResearchTopic || "",
    studyMode: userData.studyMode || "",
    preferredDegreeLevel: safeParse(userData.preferredDegreeLevel, []),
    preferredFundingType: userData.fundingRequirement || "",
    preferredCountries: safeParse(userData.preferredCountries, []),
    preferredUniversities: safeParse(userData.preferredUniversities, []),
    workExperience: safeParse(userData.workExperience, []),
    familyIncomeRange: userData.familyIncomeRange || "",
    needsFinancialSupport: userData.needsFinancialSupport || false,
    notifications: safeParse(userData.notificationPreferences, { email: true, sms: false, inSystem: true }),
    documents: {
      cv: userData.cvUrl || null,
      transcript: userData.transcriptUrl || null,
      degreeCertificate: userData.certificateUrl || userData.degreeCertificateUrl || null,
    },
  } as any;
};

export default function StudentProfilePage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Partial<ProfileFormValues>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const latestUser = await getMe();
        updateUser(latestUser);
        setProfileData(mapUserToFormValues(latestUser));
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        if (user) setProfileData(mapUserToFormValues(user));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []); // Run exactly once on mount

  const handleSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile(data);
      updateUser({ ...user, ...data, isOnboarded: true });
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500); // Give time for the user to see the inline success message
    } catch (err: unknown) {
      throw err; // Re-throw to be caught by the form's internal handler
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <StudentProfileForm 
        onSubmit={handleSubmit} 
        initialData={profileData}
      />
    </div>
  );
}
