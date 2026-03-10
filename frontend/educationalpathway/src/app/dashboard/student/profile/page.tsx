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
      updateUser({ ...data, isOnboarded: true });
      toast.success("Profile saved");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save profile"));
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <StudentProfileForm 
        onSubmit={handleSubmit} 
        initialData={user as unknown as Partial<ProfileFormValues>}
      />
    </div>
  );
}
