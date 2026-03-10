"use client";

import { useAuth } from "@/providers/auth-context";
import {
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { getProfileCompletion } from "@/features/users/api/user-api";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [completionData, setCompletionData] = useState<{
    completionPercentage: number;
    status: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      getProfileCompletion()
        .then((data) => setCompletionData(data))
        .catch(() =>
          setCompletionData({
            completionPercentage: 0,
            status: "incomplete",
            message: "Complete profile",
          }),
        );
    }
  }, [user]);

  const stats = [
    {
      label: "Saved",
      value: "0",
      icon: Award,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "My Apps",
      value: "0",
      icon: BookOpen,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Time Spent",
      value: "--",
      icon: Clock,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Setup Score",
      value: "0%",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Welcome */}
      <section className="relative overflow-hidden rounded-xl bg-primary p-8 md:p-12 scholarship-gradient shadow-2xl shadow-primary/20">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Hello, <span className="text-secondary italic">{user?.name}!</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium max-w-md">
            Your academic adventure is in full swing. We&apos;ve found some new
            opportunities for you today.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button className="bg-white text-primary hover:bg-white/90 font-black px-6 h-12 rounded-xl">
              Quick Discovery
            </Button>
            <Button
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10 font-bold px-6 h-12 rounded-xl"
            >
              Edit My Profile
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 mr-10 mb-10 opacity-10">
          <GraduationCap className="h-64 w-64 text-white" />
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-card p-6 rounded-xl shadow-sm border border-border flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Scholarships */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Top Matches</h2>
            <Link
              href="/dashboard/scholarships"
              className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            <Card className="border-dashed py-12">
              <CardBody className="flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-foreground mb-1">
                  No matches found
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  We&apos;ll notify you when we find scholarships matching your
                  profile.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Action Center */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">To-Do List</h2>

          {/* Notifications */}
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <p className="text-sm text-muted-foreground">
                  {completionData?.status === "completed"
                    ? "🎉 Profile completed! We'll notify you when scholarships match your profile."
                    : "📝 Complete your profile to get personalized scholarship recommendations."}
                </p>
              </div>
            </div>
          </div>
          {/* Profile Completion Progress */}
          {completionData && completionData.status === "incomplete" && (
            <div className="bg-primary p-6 rounded-xl text-white scholarship-gradient shadow-xl shadow-primary/20 mb-4">
              <h3 className="font-bold text-lg mb-2">Complete Profile</h3>
              <p className="text-sm text-gray-100 mb-2 font-medium">
                Your profile is {completionData.completionPercentage}% complete.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-white h-2 rounded-full"
                  style={{ width: `${completionData.completionPercentage}%` }}
                ></div>
              </div>
              <Link
                href="/dashboard/student/profile"
                className="w-full py-3 bg-white text-primary rounded-xl font-bold text-center block text-sm hover:bg-white/90 transition-colors text-gray-900"
              >
                {completionData.message}
              </Link>
            </div>
          )}
          {/* If profile completed, show waiting message */}
          {completionData && completionData.status === "completed" && (
            <div className="bg-green-600 p-6 rounded-xl text-white shadow-xl shadow-green-600/20 mb-4">
              <h3 className="font-bold text-lg mb-2">Profile Completed!</h3>
              <p className="text-sm text-green-100 mb-2 font-medium">
                {completionData.message}
              </p>
              <div className="w-full bg-green-200 rounded-full h-2 mb-4">
                <div
                  className="bg-white h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
              <p className="text-xs text-green-100">
                We'll notify you via email and dashboard when scholarships match
                your profile.
              </p>
            </div>
          )}

          <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h3 className="font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full text-left p-3 rounded-xl hover:bg-muted transition-colors flex items-center justify-between group h-auto font-medium text-foreground"
              >
                <span>Upload Latest CV</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left p-3 rounded-xl hover:bg-muted transition-colors flex items-center justify-between group h-auto font-medium text-foreground"
              >
                <span>Take Career Test</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
