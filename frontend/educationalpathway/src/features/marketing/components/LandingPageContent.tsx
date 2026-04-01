'use client';

import Link from "next/link";
import {
  GraduationCap,
  Award,
  BookOpen,
  Users,
  ArrowRight,
  CheckCircle2,
  Globe,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Zap,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { motion } from "framer-motion";


const features = [
  {
    icon: Award,
    title: "Smart Scholarship Match",
    description:
      "Our AI engine analyzes your academic profile, goals, and background to surface the scholarships most aligned with your potential — not just your grades.",
    color: "bg-emerald-500/20 text-emerald-400",
    border: "hover:border-emerald-400/50",
  },
  {
    icon: Users,
    title: "Expert Counselor Network",
    description:
      "Connect with verified counselors who have guided hundreds of students to scholarship success. Get personalized advice, CV reviews, and interview prep.",
    color: "bg-teal-500/20 text-teal-400",
    border: "hover:border-teal-400/50",
  },
  {
    icon: BookOpen,
    title: "Academic Path Planning",
    description:
      "Map out your academic journey from where you are today to where you want to be. Visualize deadlines, requirements, and milestones in one place.",
    color: "bg-green-500/20 text-green-400",
    border: "hover:border-green-400/50",
  },
  {
    icon: Zap,
    title: "AI-Powered Assessments",
    description:
      "Take mock IELTS and TOEFL exams powered by AI. Get instant scoring, personalized feedback reports, and adaptive learning tags to target your weak points.",
    color: "bg-emerald-400/20 text-emerald-400",
    border: "hover:border-emerald-500/50",
  },
];

const steps = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Tell us about your academic background, goals, preferred countries, and field of study.",
    icon: Target,
  },
  {
    step: "02",
    title: "Discover Matches",
    description: "Our AI instantly surfaces scholarships ranked by how well they fit your unique profile.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Get Expert Guidance",
    description: "Book sessions with vetted counselors who specialize in your target scholarship programs.",
    icon: ShieldCheck,
  },
  {
    step: "04",
    title: "Apply & Succeed",
    description: "Submit polished, competitive applications with AI-assisted writing and track your progress.",
    icon: TrendingUp,
  },
];


export const LandingPageContent = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">

      {/* ─── NAVBAR ─── */}
      <header className="px-6 lg:px-12 h-16 flex items-center border-b border-emerald-900/50 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md">
        <Link className="flex items-center gap-2.5" href="/">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-lg blur opacity-20" />
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src="/admas.png"
                alt="አድማስ Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
            </div>
          </div>
          <span className="text-xl font-bold text-emerald-500 tracking-tight">
            አድማስ
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-8">
          <Link className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors hidden md:block" href="/#features">
            Features
          </Link>
          <Link className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors hidden md:block" href="/#how">
            How it Works
          </Link>
          <Link href="/login">
            <Button size="sm" variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
              Log In
            </Button>
          </Link>
          <Link href="/role-selection">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">

        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden py-24 md:py-36 bg-slate-950">

          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-slate-800/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[120px]" />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          </div>

          <div className="relative container px-4 md:px-6 mx-auto text-center max-w-5xl">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-sm font-serif mb-8"
            >
              <Sparkles className="h-4 w-4 font-serif" />
              AI-Powered Scholarship Discovery Platform
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 font-serif"
            >
              Your Path to a{" "}
              <span
                className="text-transparent bg-clip-text bg-linear-to-r from-emerald-300 to-teal-200">
                Global Education
              </span>{" "}
              Starts Here
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto max-w-3xl text-lg md:text-xl text-slate-300 leading-relaxed mb-10"
            >
              አድማስ connects Ethiopian and African students with life-changing scholarships, expert counselors, and AI-powered tools — all in one platform. Discover your match today.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link href="/role-selection">
                <Button size="xl" className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-emerald-500/20 px-10 group">
                  Find Your Scholarship
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/#how">
                <Button size="xl" variant="outline" className="border-slate-700 text-slate-100 hover:bg-slate-800/50 hover:border-slate-600 px-10 bg-slate-800">
                  See How It Works
                </Button>
              </Link>
            </motion.div>

            {/* Removed: No credit card / 100% free badges */}
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" className="py-24 md:py-32 bg-slate-950">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">

            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">
                Platform Features
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Everything you need for your{" "}
                <span className="text-emerald-400">academic breakthrough</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                From discovery to acceptance — አድማስ supports every step of your scholarship journey with intelligent tools and human expertise.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`group flex gap-5 p-7 bg-slate-900/50 rounded-lg border border-slate-800 ${f.border} transition-all duration-300 hover: hover:shadow-emerald-500/10`}
                  >
                    <div
                     className={`shrink-0 p-3 rounded-lg ${f.color} h-fit group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                      <p className="text-slate-400 leading-relaxed text-sm">{f.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how" className="py-24 md:py-32 bg-slate-950">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">

            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">
                Simple Process
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                From profile to scholarship — in few steps
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                We've made the process clear, guided, and stress-free.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="relative flex flex-col gap-4 p-7 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-800 transition-all"
                  >
                    <span className="text-5xl font-black text-slate-700 absolute top-5 right-6 leading-none opacity-20">
                      {s.step}
                    </span>
                    <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400 w-fit">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{s.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{s.description}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <Link href="/role-selection">
                <Button size="lg" className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold px-10 group">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-24 bg-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl" />
          </div>
          <div className="relative container px-4 md:px-6 mx-auto max-w-4xl text-center">
            <Globe className="h-12 w-12 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              Ready to unlock your potential?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of students who transformed their academic future with አድማስ. Your scholarship is waiting — let's find it together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/role-selection">
                <Button size="xl" className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-12 shadow-emerald-500/20 group">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="xl" variant="outline" className="border-slate-700 text-slate-100 hover:bg-slate-800/50 px-10 bg-slate-800">
                  I already have an account
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};
