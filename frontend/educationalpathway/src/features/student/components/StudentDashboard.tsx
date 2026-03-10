"use client";

import { useAuth } from "@/providers/auth-context";
import {
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  ChevronRight,
  GraduationCap,
  Sparkles,
  ArrowRight,
  MessageSquare,
  FileText,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export const StudentDashboard = () => {
  const { user } = useAuth();

  // Calculate profile completion percentage based on user object
  const calculateCompletion = () => {
    if (!user) return 0;
    
    // Define fields that contribute to profile completion from the profileSchema
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

    // Array fields - count as filled if not empty if arrays were added correctly
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
      label: "Saved Opportunities",
      value: "12",
      icon: Award,
      color: "text-blue-600",
      bg: "bg-blue-100",
      description: "Ready to apply"
    },
    {
      label: "Applications",
      value: "4",
      icon: BookOpen,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      description: "2 in review"
    },
    {
      label: "Deadlines",
      value: "3",
      icon: Clock,
      color: "text-rose-600",
      bg: "bg-rose-100",
      description: "Ending soon"
    },
    {
      label: "Profile Strength",
      value: `${completionRate}%`,
      icon: TrendingUp,
      circular: true,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      description: "Complete to match"
    },
  ];

  return (
    <div className="relative min-h-screen space-y-10 pb-12 overflow-hidden transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[35%] h-[35%] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />

      {/* Hero Welcome Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-10 md:p-14 shadow-2xl shadow-slate-900/20"
      >
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            Scholarship Discovery
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-[1.05]">
            Hello, <br/>
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent italic">{user?.name}</span>
          </h1>
          <p className="text-slate-400 text-xl font-medium max-w-xl mb-12 leading-relaxed">
            Your academic journey is in full swing. We&apos;ve discovered <span className="text-white font-bold">8 new scholarships</span> that match your profile.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link href="/dashboard/scholarships">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 h-16 rounded-[1.5rem] shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 text-base">
                Explore Matches <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard/student/profile">
              <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 font-bold px-10 h-16 rounded-[1.5rem] backdrop-blur-md text-base transition-all">
                Update Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 mt-12 mr-12 opacity-[0.05] rotate-12 scale-150">
          <GraduationCap className="h-64 w-64 text-white" />
        </div>
      </motion.section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-default"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className={`h-7 w-7 ${stat.color}`} />
              </div>
              {stat.circular && (
                <div className="relative w-14 h-14">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="5"
                      fill="transparent"
                      className="text-slate-100"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={150.8}
                      strokeDashoffset={150.8 - (150.8 * completionRate) / 100}
                      className="text-emerald-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-900">
                    {completionRate}%
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-slate-950 tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-slate-400 font-semibold mt-2">
                {stat.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recommended Scholarships */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-3xl font-black text-slate-950 tracking-tight">Top Match Selections</h2>
              <p className="text-slate-500 font-medium">Scholarships tailored to your background and goals</p>
            </div>
            <Link
              href="/dashboard/scholarships"
              className="text-sm font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1 group"
            >
              View All <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="bg-white/50 backdrop-blur-md rounded-[3rem] border border-slate-200 border-dashed py-20 shadow-sm">
            <div className="flex flex-col items-center justify-center text-center px-10">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <GraduationCap className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="font-black text-2xl text-slate-950 mb-3">
                No active matches yet
              </h3>
              <p className="text-slate-500 font-medium max-w-sm leading-relaxed mb-8">
                Keep your profile updated! We&apos;ll notify you immediately when we find scholarships that match your academic history.
              </p>
              <Link href="/dashboard/student/profile">
                <Button className="rounded-2xl h-14 px-8 bg-slate-950 text-white font-bold shadow-lg shadow-slate-950/10">
                  Boost Profile Score
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Action Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="px-2">
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">Activity</h2>
            <p className="text-sm text-slate-500 font-medium">Recent updates & reminders</p>
          </div>
          
          <Card className="rounded-[2.5rem] border-slate-100 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardBody className="p-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-none mb-1">Profile Incomplete</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Add your transcript to increase match accuracy by 40%.</p>
                  </div>
                </div>

                <div className="flex gap-4 opacity-50">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-none mb-1">Counselor Message</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">No new messages from advisors.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-5 rounded-3xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Next Step</p>
                <p className="text-sm text-slate-700 font-bold mb-4 italic">Complete Step 3: Financial Need</p>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

