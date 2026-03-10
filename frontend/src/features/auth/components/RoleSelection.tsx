"use client";

import Link from "next/link";
import { GraduationCap, Briefcase, ArrowRight } from "lucide-react";

export function RoleSelection() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Welcome to <span className="text-primary">EduPathway</span>
          </h1>

          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Pick your role to start your journey.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto rounded-sm">
          {/* Student Card */}
          <Link href="/register?role=student" className="group">
            <div className="relative bg-white rounded-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-200">
              {/* Card Content */}
              <div className="p-8">
                {/* Icon */}
                <div className="w-16 h-16 bg-linear-to-br from-primary/10 to-primary/5 rounded-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  I&apos;m a Student
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Find scholarships, track your applications, and get help for your studies.
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-8">
                  {[
                    "Find Scholarships",
                    "Track Applications",
                    "AI Help",
                    "Easy Dashboard",
                  ].map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <div className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 bg-primary text-white font-semibold rounded-sm hover:bg-primary/90 transition-colors group/btn">
                  Start as Student
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Counselor Card */}
          <Link href="/register?role=counselor" className="group">
            <div className="relative bg-white rounded-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-200">
              <div className="p-8">
                {/* Icon */}
                <div className="w-16 h-16 bg-linear-to-br from-secondary/10 to-secondary/5 rounded-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-8 w-8 text-secondary" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-secondary transition-colors">
                  I&apos;m a Counselor
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Help students, manage applications, and share what you know.
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-8">
                  {[
                    "Manage Students",
                    "Review Applications",
                    "Charts and Data",
                    "Resources",
                  ].map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <div className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 bg-secondary text-white font-semibold rounded-sm hover:bg-secondary/90 transition-colors group/btn">
                  Start as Counselor
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
