"use client";

import Link from "next/link";
import { GraduationCap, Briefcase, Check } from "lucide-react";

export function RoleSelection() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-12">

      <div className="w-full max-w-6xl">


        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-2xl md:text-5xl font-serif text-gray-900 tracking-tight mb-4">
            Choose Your Role
          </h1>

          <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base">
            Select how you want to use EduPathway and start your journey.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* STUDENT */}
          <Link href="/register?role=student" className="group">
            <div className="bg-white rounded-sm border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">

              <div className="p-8">

                {/* Icon */}
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-serif text-gray-900 mb-3 group-hover:text-primary transition">
                  I'm a Student
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                  Discover scholarships, track your applications, and get AI
                  support for your education journey.
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8 list-none">
                  {[
                    "Discover Scholarships",
                    "Track Applications",
                    "AI Assistance",
                    "Personal Dashboard",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <div className="flex items-center justify-center gap-2 w-full py-3 rounded-sm bg-green-500 text-white font-medium hover:bg-green-800 transition group/btn">
                  Start as Student
                </div>

              </div>
            </div>
          </Link>

          {/* COUNSELOR */}
          <Link href="/register?role=counselor" className="group">
            <div className="bg-white rounded-sm border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">

              <div className="p-8">

                {/* Icon */}
                <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <Briefcase className="h-8 w-8 text-secondary" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-serif text-gray-900 mb-3 group-hover:text-secondary transition">
                  I'm a Counselor
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                  Guide students, review applications, and manage educational
                  resources effectively.
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8 list-none">
                  {[
                    "Manage Students",
                    "Review Applications",
                    "Analytics Dashboard",
                    "Educational Resources",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <div className="flex items-center justify-center gap-2 w-full py-3 rounded-sm bg-green-500 text-white font-medium hover:bg-green-800 transition group/btn">
                  Start as Counselor
                </div>

              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-14 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}