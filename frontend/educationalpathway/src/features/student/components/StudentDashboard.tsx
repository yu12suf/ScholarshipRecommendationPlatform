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
  FileText
} from "lucide-react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export const StudentDashboard = () => {
  const { user } = useAuth();

  const calculateCompletion = () => {
    if (!user) return 0;

    const fields = [
      user.name,
      user.email,
      user.gender,
      user.dateOfBirth,
      user.nationality,
      user.countryOfResidence,
      user.city,
      user.phoneNumber,
      user.currentEducationLevel,
      user.degreeSeeking,
      user.previousUniversity,
      user.graduationYear,
      user.gpa,
      user.preferredFundingType,
      user.studyMode,
    ];

    const arrayFields = [
      user.fieldOfStudyInput,
      user.preferredDegreeLevel,
      user.preferredCountries,
      user.preferredUniversities,
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
        className="rounded-lg border border-border bg-card p-10 shadow-sm relative overflow-hidden"
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
          <Card key={idx} className="border border-border bg-card hover:shadow-md transition">

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

        {/* Scholarships */}
        <div className="lg:col-span-2 space-y-8">

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


          <Card className="border border-dashed border-border bg-muted">

            <CardBody className="py-24 text-center">

              <h3 className="h4">
                Scanning for matches...
              </h3>

              <p className="text-small mt-2 max-w-sm mx-auto">
                Complete your profile to unlock more scholarship opportunities.
              </p>

              <Link href="/dashboard/student/profile">
                <Button className="mt-8 primary-gradient text-white">
                  Enhance Your Profile
                </Button>
              </Link>

            </CardBody>

          </Card>

        </div>


        {/* Activity */}
        <div className="space-y-8">

          <div className="border-b border-border pb-4">
            <h2 className="h3">Recent Activity</h2>
            <p className="text-small mt-1">
              Stay updated on your status.
            </p>
          </div>


          <Card className="border border-border bg-card">

            <CardBody className="p-8 space-y-8">

              <div className="flex gap-4">

                <div className="h-10 w-10 bg-muted flex items-center justify-center rounded-md">
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


              <div className="flex gap-4">

                <div className="h-10 w-10 bg-muted flex items-center justify-center rounded-md">
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

                <div className="w-full bg-muted h-1.5 rounded">
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