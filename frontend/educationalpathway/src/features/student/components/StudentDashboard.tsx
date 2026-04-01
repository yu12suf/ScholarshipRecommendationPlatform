"use client";

import { useAuth } from "@/providers/auth-context";
import {
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  FileText,
  UserPlus
} from "lucide-react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getScholarships } from "@/features/scholarships/api/get-scholarships";
import { Scholarship } from "@/features/scholarships/types";
import { ScholarshipCard } from "@/features/scholarships/components/ScholarshipCard";
import { getRecommendedCounselors } from "@/features/counselor/api/counselor-api";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Scholarship[]>([]);
  const [recommendedCounselors, setRecommendedCounselors] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingCounselors, setLoadingCounselors] = useState(true);

  useEffect(() => {
    if (user && !user.isOnboarded) {
      router.push("/dashboard/student/profile");
    }
  }, [user, user?.isOnboarded, router]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getScholarships();
        setMatches(data);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setLoadingMatches(false);
      }
    };

    const fetchCounselors = async () => {
      try {
        const data = await getRecommendedCounselors();
        setRecommendedCounselors(data);
      } catch (error) {
        console.error("Failed to fetch recommended counselors:", error);
      } finally {
        setLoadingCounselors(false);
      }
    };

    if (user?.isOnboarded) {
      fetchMatches();
      fetchCounselors();
    } else {
      setLoadingMatches(false);
      setLoadingCounselors(false);
    }
  }, [user?.isOnboarded]);

  const calculateCompletion = () => {
    if (!user) return 0;

    const safeParse = (str: any) => {
      if (!str) return [];
      try {
        return typeof str === "string" ? JSON.parse(str) : str;
      } catch {
        return [];
      }
    };

    const fields = [
      user.name,
      user.email,
      user.gender,
      user.dateOfBirth,
      user.nationality,
      user.countryOfResidence,
      user.city,
      user.phoneNumber,
      user.currentEducationLevel || user.academicStatus,
      user.degreeSeeking,
      user.previousUniversity || user.currentUniversity,
      user.graduationYear,
      user.gpa || user.calculatedGpa,
      user.preferredFundingType || user.fundingRequirement,
      user.studyMode,
      user.languageTestType,
      user.languageScore || user.testScore,
      user.researchArea,
      user.proposedResearchTopic,
      user.familyIncomeRange,
      user.cvUrl,
      user.transcriptUrl,
      user.degreeCertificateUrl,
    ];

    const arrayFields = [
      safeParse(user.fieldOfStudyInput || user.fieldOfStudy),
      safeParse(user.preferredDegreeLevel),
      safeParse(user.preferredCountries),
      safeParse(user.preferredUniversities),
      safeParse(user.workExperience),
    ];

    const filledBasic = fields.filter(
      (f) => f !== undefined && f !== null && f !== ""
    ).length;

    const filledArrays = arrayFields.filter(
      (f) => Array.isArray(f) && f.length > 0
    ).length;

    const totalFields = fields.length + arrayFields.length;
    const totalFilled = filledBasic + filledArrays;

    return Math.round((totalFilled / totalFields) * 100);
  };

  const completionRate = calculateCompletion();

  const stats = [
    {
      label: "Saved Scholarships",
      value: "-",
      icon: Award,
      description: "Opportunities you bookmarked",
    },
    {
      label: "Applications",
      value: "-",
      icon: BookOpen,
      description: "Scholarships applied",
    },
    {
      label: "Upcoming Deadlines",
      value: "-",
      icon: Clock,
      description: "Deadlines approaching",
    },
    {
      label: "Profile Strength",
      value: `${completionRate}%`,
      icon: TrendingUp,
      description: "Complete your profile",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground space-y-12 pb-20">
      
      {/* Welcome */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card p-10 relative overflow-hidden"
      >
        <div className="relative z-10 max-w-3xl">
          <h1 className="h1 mb-4">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}
          </h1>

          <p className="text-muted-foreground text-body mb-10 max-w-2xl">
            Discover scholarships tailored to your academic background.
            Keep your profile updated to reach your maximum matching potential.
          </p>

          <div className="flex gap-4 flex-wrap">

            <Link href="/dashboard/scholarships">
              <Button className="h-12 px-8 primary-gradient text-white">
                Explore Scholarships
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard/student/profile">
              <Button variant="outline" className="h-12 px-8">
                Update Profile
              </Button>
            </Link>

          </div>
        </div>

        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-50" />
      </motion.section>


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {stats.map((stat, idx) => (
          <Card key={idx} className="border border-border bg-card hover: transition">

            <CardBody className="p-8">

              <span className="text-label">{stat.label}</span>

              <div className="flex items-center justify-between mt-2">
                <p className="text-3xl font-semibold">{stat.value}</p>
              </div>

              <p className="text-small mt-2">
                {stat.description}
              </p>

            </CardBody>

          </Card>
        ))}

      </div>


      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left/Middle Column */}
        <div className="lg:col-span-2 space-y-12">

          {/* Scholarships */}
          <div className="space-y-8">

            <div className="flex justify-between items-end border-b border-border pb-4">

              <div>
                <h2 className="h3">Recommended Scholarships</h2>
                <p className="text-small mt-1">
                  Personalized opportunities based on your academic profile.
                </p>
              </div>

              <Link
                href="/dashboard/scholarships"
                className="flex items-center text-primary font-semibold hover:opacity-80"
              >
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loadingMatches ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="animate-pulse border border-border bg-card h-48" />
                ))
              ) : matches.length > 0 ? (
                matches.slice(0, 4).map((match) => (
                  <ScholarshipCard key={match.id} scholarship={match} />
                ))
              ) : (
                <Card className="border border-dashed border-border bg-muted col-span-2">
                  <CardBody className="py-24 text-center">
                    <h3 className="h4">Scanning for matches...</h3>
                    <p className="text-small mt-2 max-w-sm mx-auto">
                      {user?.isOnboarded 
                        ? "We haven't found exact matches yet. Try updating your profile with more details."
                        : "Complete your profile to unlock more scholarship opportunities."}
                    </p>
                    <Link href="/dashboard/student/profile">
                      <Button className="mt-8 primary-gradient text-white">
                        {user?.isOnboarded ? "Update Profile" : "Enhance Your Profile"}
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              )}
            </div>

          </div>

          {/* More Scholarships */}
          <div className="space-y-8">

            <div className="flex justify-between items-end border-b border-border pb-4">

              <div>
                <h2 className="h3">Matched Opportunities</h2>
                <p className="text-small mt-1">
                  High-priority scholarships that match your academic status perfectly.
                </p>
              </div>

              <Link
                href="/dashboard/scholarships"
                className="flex items-center text-primary font-semibold hover:opacity-80"
              >
                Find more
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>

            </div>

            <div className="grid grid-cols-1 gap-4">
              {loadingMatches ? (
                <Card className="animate-pulse border border-border bg-card h-24" />
              ) : matches?.length > 0 ? (
                matches?.slice(4, 6).map((match) => (
                  <Card key={match?.id} className="border border-border bg-card hover:border-primary/30 transition-all cursor-pointer">
                    <CardBody className="p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-12 w-12 rounded-full primary-gradient flex items-center justify-center font-bold text-white shrink-0 shadow-sm">
                          <Award size={20} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-foreground truncate">{match?.title || 'Scholarship Match'}</h4>
                          <p className="text-[12px] text-muted-foreground truncate">{match?.provider || 'Academic Provider'}</p>
                        </div>
                      </div>
                      <Link href={`/dashboard/scholarships/${match?.id}`}>
                        <Button variant="outline" size="sm" className="shrink-0 h-9 px-4 font-semibold cursor-pointer">
                          View
                        </Button>
                      </Link>
                    </CardBody>
                  </Card>
                ))
              ) : (
                <div className="py-8 text-center bg-muted/30 rounded-lg border border-dashed border-border">
                  <p className="text-small text-muted-foreground">Finding more opportunities...</p>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column (Activity) */}
        <div className="space-y-8">
          {/* ... existing activity card ... */}

          <div className="border-b border-border pb-4">
            <h2 className="h3">Recent Activity</h2>
            <p className="text-small mt-1">
              Stay updated on your status.
            </p>
          </div>


          <Card className="border border-border bg-card">

            <CardBody className="p-8 space-y-8">

              {!user?.isOnboarded && (
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-muted flex items-center justify-center rounded-lg">
                    <FileText className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      Profile Completion Required
                    </p>
                    <p className="text-small mt-1">
                      Your current visibility to scholarships is limited.
                    </p>
                  </div>
                </div>
              )}

              {user?.isOnboarded && matches.length > 0 && (
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-muted flex items-center justify-center rounded-lg">
                    <Award className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      Scholarships Matched
                    </p>
                    <p className="text-small mt-1">
                      We found {matches.length} scholarship{matches.length > 1 ? 's' : ''} for you.
                    </p>
                  </div>
                </div>
              )}


              <div className="flex gap-4">

                <div className="h-10 w-10 bg-muted flex items-center justify-center rounded-lg">
                  <MessageSquare className="h-5 w-5 text-info" />
                </div>

                <div>
                  <p className="font-semibold text-sm">
                    Inbox Clear
                  </p>
                  <p className="text-small mt-1">
                    No new messages from guidance counselors.
                  </p>
                </div>

              </div>


              {/* Progress */}
              <div className="pt-6 border-t border-border">

                <div className="flex justify-between items-center mb-3">
                  <span className="text-label">Profile Strength</span>
                  <span className="text-primary font-semibold">
                    {completionRate}%
                  </span>
                </div>

                <div className="w-full bg-muted h-1.5 rounded-lg">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    className="h-full bg-primary"
                  />
                </div>

                <p className="text-small mt-4">
                  A stronger profile increases your chances of matching with scholarships.
                </p>

              </div>

            </CardBody>

          </Card>

        </div>

      </div>

    </div>
  );
};
