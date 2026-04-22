'use client';

import Link from "next/link";
import {
  GraduationCap,
  Award,
  BookOpen,
  Users,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Zap,
  ShieldCheck,
  Target,
  Globe,
  PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: Award,
    title: "Smart Scholarship Match",
    description: "Our AI engine analyzes your academic profile, goals, and background to surface scholarships perfectly aligned with your sheer potential.",
    color: "from-emerald-400 to-emerald-600",
    shadow: "shadow-emerald-500/20",
  },
  {
    icon: Users,
    title: "Expert Counselor Network",
    description: "Connect with verified counselors who have guided hundreds. Get personalized advice, CV reviews, and targeted interview prep.",
    color: "from-teal-400 to-cyan-500",
    shadow: "shadow-cyan-500/20",
  },
  {
    icon: BookOpen,
    title: "Academic Path Planning",
    description: "Visualize deadlines, requirements, and milestones in one cinematic dashboard. Map your journey from today to graduation.",
    color: "from-indigo-400 to-violet-500",
    shadow: "shadow-violet-500/20",
  },
  {
    icon: Zap,
    title: "AI-Powered Assessments",
    description: "Take mock exams powered by AI. Get instant scoring, personalized feedback reports, and adaptive learning tags for rapid improvement.",
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-orange-500/20",
  },
];

const steps = [
  {
    step: "01",
    title: "Create Profile",
    description: "Share your academic background and global study preferences.",
    icon: Target,
  },
  {
    step: "02",
    title: "AI Discovery",
    description: "Our engine maps you to opportunities worldwide instantly.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Expert Strategy",
    description: "Refine your approach with specialized admission counselors.",
    icon: ShieldCheck,
  },
  {
    step: "04",
    title: "Apply & Win",
    description: "Submit flawless applications and secure your academic future.",
    icon: TrendingUp,
  },
];

export const LandingPageContent = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] selection:bg-emerald-500/30 selection:text-emerald-200 overflow-hidden" ref={containerRef}>
      
      {/* ─── DYNAMIC BACKGROUND ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-600/10 blur-[120px] mix-blend-screen animate-pulse duration-10000" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-teal-600/10 blur-[150px] mix-blend-screen" />
         <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-indigo-500/5 blur-[100px] mix-blend-screen" />
         <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5" />
      </div>

      {/* ─── GLASS NAVBAR ─── */}
      <motion.header 
         initial={{ y: -20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
         className="px-6 lg:px-12 h-20 flex items-center border-b border-white/5 sticky top-0 z-50 bg-[#050505]/60 backdrop-blur-2xl"
      >
        <Link className="flex items-center gap-3 group" href="/">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-emerald-400/20 to-teal-900/40 border border-emerald-500/20 group-hover:border-emerald-400/50 transition-colors">
            <Image
              src="/admas.png"
              alt="Admas Logo"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-white to-white/70 tracking-tight">
            አድማስ
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-8">
          <Link className="text-sm font-bold text-white/60 hover:text-white transition-colors hidden md:block" href="/#features">
            Features
          </Link>
          <Link className="text-sm font-bold text-white/60 hover:text-white transition-colors hidden md:block" href="/#how">
            Methodology
          </Link>
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          <Link href="/login">
            <button className="text-sm font-bold text-white/80 hover:text-white transition-colors px-4 py-2">
              Sign In
            </button>
          </Link>
          <Link href="/role-selection">
            <button className="relative overflow-hidden group px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all shadow-lg hover:shadow-emerald-500/20">
              <span className="absolute inset-0 w-full h-full bg-linear-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              Get Started
            </button>
          </Link>
        </nav>
      </motion.header>

      <main className="flex-1 relative z-10">

        {/* ─── HERO SECTION ─── */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
          <div className="container mx-auto max-w-5xl text-center space-y-10">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-xs font-bold tracking-widest uppercase mx-auto"
            >
              <Sparkles size={14} className="text-emerald-400 animate-pulse" />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-300 to-teal-200">
                Next-Gen AI Matching Engine
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.05]"
            >
              Engineering Your <br className="hidden md:block" />
              <span className="relative inline-block mt-2">
                <span className="absolute -inset-2 bg-linear-to-r from-emerald-500/20 to-teal-500/20 blur-2xl rounded-full" />
                <span className="relative text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Global Education.
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-2xl text-lg md:text-xl text-white/50 leading-relaxed font-medium"
            >
              The unified platform for Ethiopian and African students. Discover perfect-fit scholarships, practice language exams, and connect with elite admission counselors.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-8"
            >
              <Link href="/role-selection">
                <button className="h-14 px-8 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 text-white font-black tracking-wide flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)]">
                  START YOUR PATHWAY
                  <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/#how">
                <button className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-bold tracking-wide flex items-center gap-3 hover:bg-white/10 transition-all backdrop-blur-md">
                  <PlayCircle size={18} className="text-white/60" />
                  SEE HOW IT WORKS
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ─── FEATURES GRID ─── */}
        <section id="features" className="py-32 relative">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">
                Smarter tools. <br />
                <span className="text-white/40">Better outcomes.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative p-1 rounded-3xl overflow-hidden bg-linear-to-b from-white/10 to-transparent hover:from-white/20 transition-all duration-500"
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${f.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className="relative h-full bg-[#0a0a0a] rounded-[22px] p-8 md:p-10 flex flex-col gap-6">
                    <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${f.color} p-px shadow-lg ${f.shadow} group-hover:scale-110 transition-transform duration-500`}>
                      <div className="w-full h-full bg-[#111] rounded-[15px] flex items-center justify-center">
                        <f.icon className="text-white" size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                      <p className="text-white/50 leading-relaxed font-medium">{f.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PROCESS TIMELINE ─── */}
        <section id="how" className="py-32 relative border-t border-white/5 bg-linear-to-b from-transparent to-emerald-950/20">
          <div className="container mx-auto max-w-7xl px-6 aspect-video">
            <div className="text-center mb-24 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">
                Your journey, <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">demystified.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Desktop connecting line */}
              <div className="hidden md:block absolute top-[44px] left-10 right-10 h-0.5 bg-linear-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0" />

              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.15, type: "spring" }}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  <div className="w-24 h-24 rounded-full bg-black border-2 border-white/10 flex items-center justify-center mb-8 relative group-hover:border-emerald-500/50 transition-colors duration-500 shadow-xl">
                    <div className="absolute inset-2 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                       <s.icon size={28} className="text-white/80 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div className="absolute -bottom-3 px-3 py-1 bg-[#111] border border-white/10 rounded-full text-[10px] font-black tracking-widest text-emerald-500">
                      STEP {s.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed px-4">{s.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="py-32 relative overflow-hidden flex items-center justify-center min-h-[60vh]">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-linear-to-r from-emerald-600/20 to-teal-500/20 blur-[100px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center"
          >
            <div className="p-px rounded-[3rem] bg-linear-to-b from-white/20 to-white/0 shadow-2xl">
              <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[calc(3rem-1px)] p-12 md:p-20 border border-white/5">
                <Globe className="h-16 w-16 text-emerald-400 mx-auto mb-8 opacity-80" strokeWidth={1} />
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
                  Ready to go global?
                </h2>
                <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
                  Join thousands of students securing their academic futures through data-driven matching and expert counseling.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/role-selection">
                    <button className="h-14 px-10 rounded-2xl bg-white text-black font-black tracking-wide flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
                      LAUNCH PLATFORM
                      <ArrowRight size={18} />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
};
