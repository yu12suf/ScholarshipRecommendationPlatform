import { redirect } from "next/navigation";

export default function OnboardingPage() {
  // onboarding route is deprecated; send users straight to profile form
  redirect("/dashboard/student/profile");
}
