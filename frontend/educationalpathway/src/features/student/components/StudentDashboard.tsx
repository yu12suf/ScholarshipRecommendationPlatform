"use client";

import { useAuth } from "@/providers/auth-context";
import {
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  ChevronRight,
  GraduationCap,
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
    <div className="min-h-screen bg-white space-y-10 pb-12">

      {/* Welcome Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-sm border border-gray-200 p-10 bg-green-100 w-full"
      >
        <div className="max-w-3xl">
          <p className="text-gray-500 text-lg mb-8">
            Discover scholarships tailored to your academic background.
            Keep your profile updated to improve your matches.
          </p>

          <div className="flex gap-4 flex-wrap">

            <Link href="/dashboard/scholarships">
              <Button size="lg" className="h-12 px-6 cursor-pointer bg-orange-300 rounded-sm">
                Explore Scholarships
                <ArrowRight className="ml-2 h-4 w-4 " />
              </Button>
            </Link>

            <Link href="/dashboard/student/profile">
              <Button size="lg" variant="outline" className="h-12 px-6 cursor-pointer">
                Update Profile
              </Button>
            </Link>

          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {stats.map((stat, idx) => (
          <Card key={idx} className="border border-gray-200 rounded-sm">
            <CardBody className="p-6">

              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-300 rounded-lg">
                  <stat.icon className="h-5 w-5 text-gray-700" />
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-1">
                {stat.label}
              </p>

              <p className="text-3xl font-bold text-gray-900">
                {stat.value}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                {stat.description}
              </p>

            </CardBody>
          </Card>
        ))}

      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recommended Scholarships */}
        <div className="lg:col-span-2 space-y-6">

          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Recommended Scholarships
              </h2>
              <p className="text-gray-500 text-sm">
                Based on your profile
              </p>
            </div>

            <Link
              href="/dashboard/scholarships"
              className="flex items-center text-sm font-medium text-blue-600"
            >
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <Card className="border border-dashed border-gray-300 rounded-sm">
            <CardBody className="py-16 text-center">

              <div className="flex justify-center mb-4">
                <GraduationCap className="h-10 w-10 text-gray-300" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                No scholarships matched yet
              </h3>

              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                Complete your profile to improve scholarship matching.
              </p>

              <Link href="/dashboard/student/profile">
                <Button className="mt-6">
                  Improve Profile
                </Button>
              </Link>

            </CardBody>
          </Card>

        </div>

        {/* Activity Panel */}
        <div className="space-y-6">

          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Activity
            </h2>
            <p className="text-sm text-gray-500">
              Recent updates
            </p>
          </div>

          <Card className="border border-gray-200 rounded-sm">
            <CardBody className="p-6 space-y-6">

              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    Profile incomplete
                  </p>
                  <p className="text-xs text-gray-500">
                    Completing your profile improves scholarship matches.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    Messages
                  </p>
                  <p className="text-xs text-gray-500">
                    No new messages from counselors.
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="pt-4 border-t border-gray-100">

                <p className="text-xs text-gray-500 mb-2">
                  Profile completion
                </p>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {completionRate}% complete
                </p>

              </div>

            </CardBody>
          </Card>

        </div>

      </div>
    </div>
  );
};