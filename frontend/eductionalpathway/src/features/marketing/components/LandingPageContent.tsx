'use client';

import Link from "next/link";
import { GraduationCap, Award, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";

export const LandingPageContent = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border sticky top-0  z-50 bg-white/80 backdrop-blur-md">
        <Link className="flex items-center justify-center gap-2" href="/">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-black text-gray-900 tracking-tight">EduPathway</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:text-primary transition-colors"
            href="/#features"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:text-primary transition-colors"
            href="/#about"
          >
            About
          </Link>
          <Link
            className="text-sm font-medium hover:text-primary transition-colors"
            href="/login"
          >
            Login
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 scholarship-gradient">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                  Go on your study{" "}
                  <span className="text-secondary italic">adventure</span>
                </h1>
                <p className="mx-auto max-w-175 text-gray-100 md:text-xl font-medium">
                  Find help, get scholarships, and plan your future with AI.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/role-selection">
                  <Button
                    size="xl"
                    className="bg-white text-primary hover:bg-white/90 font-bold px-8 shadow-xl shadow-primary/10 rounded-xl cursor-pointer"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/30"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-2 p-6 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Find Scholarships</h3>
                <p className="text-sm text-muted-foreground text-center">
                  We find the best money for your school.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-6 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold">Get Expert Help</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Talk to experts who can help you apply.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-6 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="p-3 bg-accent/10 rounded-full">
                  <BookOpen className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Plan Your Path</h3>
                <p className="text-sm text-muted-foreground text-center">
                  See your whole school journey on a map.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-6 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="p-3 bg-primary/10 rounded-full">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">AI Help</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Get info from your CV and school papers with AI.
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
