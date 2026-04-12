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
  FileText,
  Mic,
  Brain,
  MessageCircle,
  CreditCard,
  Calendar,
  BarChart3,
  Clock,
  Search,
  Video,
  Mail,
  Lock,
  BarChart,
  Star,
  Play,
  Building2,
  Clock3,
  Bell,
  Languages,
  PenTool,
  SearchCheck,
  UserCheck,
  Wallet,
  AlertCircle,
  MapPin,
  GraduationCapIcon,
  TestTube,
  FileCheck,
  UsersRound,
  CircleDollarSign,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { motion } from "framer-motion";

const features = [
  {
    icon: Award,
    title: "AI-Powered Scholarship Discovery",
    description:
      "Our intelligent recommendation engine analyzes your academic profile, goals, and background to surface scholarships you're most likely to qualify for. Get instant match scores and personalized recommendations.",
    color: "bg-emerald-500/20 text-emerald-400",
    border: "hover:border-emerald-400/50",
  },
  {
    icon: Users,
    title: "Expert Counselor Network",
    description:
      "Connect with verified Ethiopian counselors who secured international scholarships themselves. Get personalized guidance, CV reviews, essay feedback, and mock interview preparation.",
    color: "bg-teal-500/20 text-teal-400",
    border: "hover:border-teal-400/50",
  },
  {
    icon: Languages,
    title: "AI English Proficiency Assessment",
    description:
      "Take adaptive diagnostic tests for IELTS, TOEFL, and GRE. Get instant scoring, pronunciation analysis via speech AI, and personalized learning pathways to improve your English skills.",
    color: "bg-green-500/20 text-green-400",
    border: "hover:border-green-400/50",
  },
  {
    icon: FileText,
    title: "Document Assistance & Writing Tools",
    description:
      "Get AI-powered assistance for Statements of Purpose, Letters of Recommendation, and CVs. Our system provides grammar feedback, tone analysis, and suggestions aligned with university requirements.",
    color: "bg-blue-500/20 text-blue-400",
    border: "hover:border-blue-400/50",
  },
  {
    icon: CreditCard,
    title: "Secure Payment & Escrow System",
    description:
      "Book counseling sessions with confidence. Payments are held securely in escrow and released only after session completion, protecting both students and counselors.",
    color: "bg-purple-500/20 text-purple-400",
    border: "hover:border-purple-400/50",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling & Booking",
    description:
      "View counselor availability, book time slots, and manage your sessions in one place. Get automated reminders and join video sessions directly from the platform.",
    color: "bg-orange-500/20 text-orange-400",
    border: "hover:border-orange-400/50",
  },
  {
    icon: Bell,
    title: "Deadline Tracking & Reminders",
    description:
      "Track scholarship applications with personalized deadlines. Set custom reminders for yourself and receive notifications via in-app, email, or push alerts.",
    color: "bg-rose-500/20 text-rose-400",
    border: "hover:border-rose-400/50",
  },
  {
    icon: MessageCircle,
    title: "Community & Peer Support",
    description:
      "Connect with fellow students, join study groups, and share experiences. Access discussion forums moderated for quality and appropriateness.",
    color: "bg-cyan-500/20 text-cyan-400",
    border: "hover:border-cyan-400/50",
  },
];

const detailedFeatures = [
  {
    title: "Scholarship Discovery & AI Matching",
    items: [
      "Smart scholarship matching based on profile analysis",
      "Pathfinder AI - paste any scholarship for instant eligibility analysis",
      "Save & Track with automatic application checklist generation",
      "Real-time notifications for new matching scholarships",
      "Profile-based match score calculation",
    ],
    icon: SearchCheck,
  },
  {
    title: "English Proficiency & Exam Prep",
    items: [
      "Adaptive diagnostic tests (Reading, Listening, Grammar, Vocabulary)",
      "AI-powered mock interviews with speech analysis",
      "CEFR-aligned proficiency scoring",
      "Personalized adaptive learning pathways",
      "GRE, IELTS, TOEFL mock exams with instant feedback",
      "AI-generated writing feedback aligned with official rubrics",
    ],
    icon: TestTube,
  },
  {
    title: "Document Preparation",
    items: [
      "AI-assisted SOP drafting and review",
      "CV/Resume template and optimization",
      "Letter of Recommendation guidance",
      "Grammar, tone, and coherence feedback",
      "OCR/NLP for automatic document parsing",
    ],
    icon: FileCheck,
  },
  {
    title: "Counselor Integration",
    items: [
      "Verified counselor directory with specialization filters",
      "AI-recommended counselors based on your profile",
      "Secure messaging between students and counselors",
      "Session history and progress tracking",
      "Video/audio session capabilities",
    ],
    icon: UsersRound,
  },
  {
    title: "Financial Security",
    items: [
      "Integrated payment gateway (Chapa/Stripe)",
      "Escrow protection for all transactions",
      "Milestone-based counselor payment release",
      "Transparent commission handling",
    ],
    icon: CircleDollarSign,
  },
  {
    title: "Progress & Analytics",
    items: [
      "Dashboard with personalized insights",
      "Performance heat maps for exam prep",
      "Application status tracking",
      "Achievement badges and progress metrics",
      "Calendar view of all deadlines and milestones",
    ],
    icon: BarChart3,
  },
];

const steps = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Register and complete your academic profile including GPA, field of study, preferred countries, and funding needs.",
    icon: UserCheck,
  },
  {
    step: "02",
    title: "Take Assessment",
    description: "Complete our AI-powered English diagnostic to identify your proficiency level and get personalized learning recommendations.",
    icon: Brain,
  },
  {
    step: "03",
    title: "Discover Scholarships",
    description: "Our AI matches you with scholarships ranked by relevance. Use Pathfinder to analyze any external scholarship instantly.",
    icon: Search,
  },
  {
    step: "04",
    title: "Book Expert Counselor",
    description: "Connect with verified counselors, make secure payments, and book sessions to get personalized guidance.",
    icon: CalendarClock,
  },
  {
    step: "05",
    title: "Track & Succeed",
    description: "Monitor deadlines, receive reminders, submit polished applications, and track your progress to scholarship success.",
    icon: TrendingUp,
  },
];

const stats = [
  { value: "500+", label: "Scholarships Available" },
  { value: "50+", label: "Expert Counselors" },
  { value: "10K+", label: "Students Supported" },
  { value: "95%", label: "Success Rate" },
];

const testimonials = [
  {
    quote: "አድማስ helped me find scholarships I never knew existed. The AI matching was incredibly accurate!",
    name: "Sarah T.",
    role: "Scholarship Recipient, USA",
    country: "🇺🇸",
  },
  {
    quote: "The counselor booking system and escrow protection gave me confidence in seeking guidance.",
    name: "Michael B.",
    role: "Accepted to UK University",
    country: "🇬🇧",
  },
  {
    quote: "The English assessment and learning path helped me improve my IELTS score from 5.5 to 7.0.",
    name: "Helen A.",
    role: "Now studying in Canada",
    country: "🇨🇦",
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
              <img
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
            How It Works
          </Link>
          <Link className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors hidden md:block" href="/#about">
            About
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
              አድማስ (Admas) is a comprehensive platform designed to empower Ethiopian and African students in their pursuit of international education. Discover scholarships, connect with expert counselors, prepare for exams, and track your applications — all in one intelligent platform.
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

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-emerald-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── FEATURES GRID ─── */}
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
                From scholarship discovery to acceptance — አድማስ supports every step of your scholarship journey with intelligent tools and human expertise.
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

        {/* ─── DETAILED FEATURES ─── */}
        <section className="py-24 md:py-32 bg-slate-900">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-4">
                Comprehensive System
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                All-in-One Scholarship Management
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                A complete solution for every aspect of your international education journey
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {detailedFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {feature.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
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
                Your journey to a global education
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                Five simple steps from profile creation to scholarship success
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
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

        {/* ─── TESTIMONIALS ─── */}
        <section className="py-24 md:py-32 bg-slate-900">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">
                Success Stories
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                What our students say
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{t.name}</div>
                      <div className="text-sm text-slate-400">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── ABOUT SECTION ─── */}
        <section id="about" className="py-24 md:py-32 bg-slate-950">
          <div className="container px-4 md:px-6 mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">
                About አድማስ
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Empowering Ethiopian Students
              </h2>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800">
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                አድማስ (Admas) — meaning "Adventure" in Amharic — is a comprehensive platform designed to transform how Ethiopian and African students navigate their journey toward international education. Named for the adventure that awaits every student who dares to pursue education abroad, our platform combines cutting-edge AI technology with human expertise.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-white mb-3">Our Mission</h3>
                  <p className="text-slate-400 text-sm">
                    To simplify the complex process of securing international education opportunities by providing intelligent tools, expert guidance, and comprehensive support — all in one platform.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-3">Key Capabilities</h3>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      AI-powered scholarship matching
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Expert counselor network
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      English proficiency assessment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Secure payment & booking
                    </li>
                  </ul>
                </div>
              </div>
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
