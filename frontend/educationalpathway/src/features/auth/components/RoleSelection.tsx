"use client";

import Link from "next/link";
import { GraduationCap, Briefcase, Check } from "lucide-react";

export function RoleSelection() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">

      <div className="w-full max-w-6xl">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-5xl font-semibold text-foreground tracking-tight mb-4">
            Choose Your Role
          </h1>

          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Select how you want to use EduPathway and start your journey.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* STUDENT */}
          <Link href="/register?role=student" className="group">
            <div className="bg-card rounded-lg border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">

              <div className="p-8">

                {/* Icon */}
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 transition group-hover:scale-110">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition">
                  I'm a Student
                </h2>

                {/* Description */}
                <p className="text-muted-foreground mb-6">
                  Discover scholarships, track applications, and get AI
                  support for your education journey.
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {[
                    "Discover Scholarships",
                    "Track Applications",
                    "AI Assistance",
                    "Personal Dashboard",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <div className="flex items-center justify-center w-full py-3 rounded-md bg-primary text-primary-foreground font-medium transition hover:opacity-90">
                  Start as Student
                </div>

              </div>
            </div>
          </Link>

          {/* COUNSELOR */}
          <Link href="/register?role=counselor" className="group">
            <div className="bg-card rounded-lg border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">

              <div className="p-8">

                {/* Icon */}
                <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center mb-6 transition group-hover:scale-110">
                  <Briefcase className="h-7 w-7 text-secondary" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-foreground mb-3 group-hover:text-secondary transition">
                  I'm a Counselor
                </h2>

                {/* Description */}
                <p className="text-muted-foreground mb-6">
                  Guide students, review applications, and manage educational
                  resources effectively.
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {[
                    "Manage Students",
                    "Review Applications",
                    "Analytics Dashboard",
                    "Educational Resources",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <div className="flex items-center justify-center w-full py-3 rounded-md bg-primary text-primary-foreground font-medium transition hover:opacity-90">
                  Start as Counselor
                </div>

              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-14 text-center">
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}