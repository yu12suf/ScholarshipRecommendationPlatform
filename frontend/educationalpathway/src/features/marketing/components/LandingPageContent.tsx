'use client';

import Link from "next/link";
import { GraduationCap, Award, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";

export const LandingPageContent = () => {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}

      <header className="px-6 lg:px-8 h-16 flex items-center border-b border-gray-100 sticky top-0 z-50 bg-white">
        <Link className="flex items-center gap-2" href="/">
          <GraduationCap className="h-8 w-8 text-primary" />
          {/* <span className="text-xl font-bold text-gray-900 tracking-tight">
            EduPathway
          </span> */}
        </Link>

        <nav className="ml-auto flex items-center gap-6">
          <Link
            className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            href="/#features"
          >
            Features
          </Link>

          <Link
            className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            href="/#about"
          >
            About
          </Link>

          <Link href="/login">
            <Button
              size="sm"
              className="rounded-xl bg-primary text-white hover:bg-primary/90"
            >
              Login
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">

        {/* HERO SECTION */}

        <section className="relative w-full py-20 md:py-28 lg:py-32 bg-yellow-100">

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative container px-4 md:px-6 mx-auto text-center">

            <h1 className="text-xl font-serif sm:text-3xl md:text-5xl text-white">
              Your journey to{" "}
              <span className="text-secondary italic">
                scholarships
              </span>
              starts here
            </h1>

            <p className="mx-auto max-w-4xl text-lg md:text-xl text-gray-200 mt-4">
              EduPathway helps students discover scholarships, connect with
              expert guidance, and plan their academic journey using
              intelligent tools.
            </p>

          </div>
        </section>

        {/* FEATURES */}

        <section
          id="features"
          className="w-full py-20 md:py-28 bg-orange-50"
        >
          <div className="container px-4 md:px-6 mx-auto">

            <div className="text-center mb-14 space-y-3">

              <h2 className="text-2xl md:text-3xl font-serif text-gray-900">
                Everything you need for your education journey
              </h2>

              <p className="text-gray-800 max-w-2xl mx-auto">
                Our platform brings together scholarships, mentorship,
                planning tools, and AI-powered insights to help students
                succeed academically and financially.
              </p>

            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

              {/* Feature 1 */}

              <div className="group flex flex-col items-center space-y-3 p-6 bg-orange-100 rounded-sm border border-gray-100 hover:border-primary/30 transition-all">

                <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition">
                  <Award className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold">
                  Discover Scholarships
                </h3>

                <p className="text-sm text-gray-600 text-center">
                  Search and discover scholarship opportunities that match
                  your academic profile and ambitions.
                </p>

              </div>

              {/* Feature 2 */}

              <div className="group flex flex-col items-center space-y-3 p-6 bg-orange-100 rounded-sm border border-gray-100 hover:border-secondary/30 transition-all">

                <div className="p-3 bg-secondary/10 rounded-full group-hover:bg-secondary/20 transition">
                  <Users className="h-6 w-6 text-secondary" />
                </div>

                <h3 className="text-lg font-semibold">
                  Connect With Experts
                </h3>

                <p className="text-sm text-gray-600 text-center">
                  Get mentorship and guidance from experienced counselors
                  who understand the scholarship application process.
                </p>

              </div>

              {/* Feature 3 */}

              <div className="group flex flex-col items-center space-y-3 p-6 bg-orange-100 rounded-sm border border-gray-100 hover:border-accent/30 transition-all">

                <div className="p-3 bg-accent/10 rounded-full group-hover:bg-accent/20 transition">
                  <BookOpen className="h-6 w-6 text-accent" />
                </div>

                <h3 className="text-lg font-semibold">
                  Plan Your Academic Path
                </h3>

                <p className="text-sm text-gray-600 text-center">
                  Visualize your study journey and track the steps needed
                  to reach your dream university.
                </p>

              </div>

              {/* Feature 4 */}

              <div className="group flex flex-col items-center space-y-3 p-6 bg-orange-100 rounded-sm border border-gray-100 hover:border-primary/30 transition-all">

                <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-lg font-semibold">
                  AI-Powered Assistance
                </h3>

                <p className="text-sm text-gray-600 text-center">
                  Upload your CV or academic documents and receive
                  personalized scholarship recommendations powered by AI.
                </p>

              </div>

            </div>

          </div>
        </section>

      </main>

      <Footer />

    </div>
  );
};