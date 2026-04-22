"use client";

import { useAuth } from "@/providers/auth-context";
import {
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  FileText,
  Zap,
  Star,
  Target
} from "lucide-react";
import Link from "next/link";
import { 
  Card, 
  CardBody, 
  Button, 
  Badge, 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/components/ui";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getScholarships, getDashboardStats } from "@/features/scholarships/api/get-scholarships";
import { Scholarship } from "@/features/scholarships/types";
import { ScholarshipCard } from "@/features/scholarships/components/ScholarshipCard";
import { getRecommendedCounselors } from "@/features/counselor/api/counselor-api";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const StudentDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Scholarship[]>([]);
  const [recommendedCounselors, setRecommendedCounselors] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({ savedCount: 0, appliedCount: 0, deadlineCount: 0 });
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingCounselors, setLoadingCounselors] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user && !user.isOnboarded) {
      router.push("/dashboard/student/profile");
    }
  }, [user, user?.isOnboarded, router]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getScholarships();
        setMatches(data);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setLoadingMatches(false);
      }
    };

    const fetchCounselors = async () => {
      try {
        const data = await getRecommendedCounselors();
        setRecommendedCounselors(data);
      } catch (error) {
        console.error("Failed to fetch recommended counselors:", error);
      } finally {
        setLoadingCounselors(false);
      }
    };

    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStatsData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user?.isOnboarded) {
      fetchMatches();
      fetchCounselors();
      fetchStats();
    } else {
      setLoadingMatches(false);
      setLoadingCounselors(false);
      setLoadingStats(false);
    }
  }, [user?.isOnboarded]);

  const calculateCompletion = () => {
    if (!user) return 0;

    const safeParse = (str: any) => {
      if (!str) return [];
      try {
        return typeof str === "string" ? JSON.parse(str) : str;
      } catch {
        return [];
      }
    };

    const fields = [
      user.name,
      user.email,
      user.gender,
      user.dateOfBirth,
      user.nationality,
      user.countryOfResidence,
      user.city,
      user.phoneNumber,
      user.currentEducationLevel || user.academicStatus,
      user.degreeSeeking,
      user.previousUniversity || user.currentUniversity,
      user.graduationYear,
      user.gpa || user.calculatedGpa,
      user.preferredFundingType || user.fundingRequirement,
      user.studyMode,
      user.languageTestType,
      user.languageScore || user.testScore,
      user.researchArea,
      user.proposedResearchTopic,
      user.familyIncomeRange,
      user.cvUrl,
      user.transcriptUrl,
      user.degreeCertificateUrl,
    ];

    const arrayFields = [
      safeParse(user.fieldOfStudyInput || user.fieldOfStudy),
      safeParse(user.preferredDegreeLevel),
      safeParse(user.preferredCountries),
      safeParse(user.preferredUniversities),
      safeParse(user.workExperience),
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
      label: "Saved",
      value: statsData.savedCount.toString(),
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      description: "Bookmarked opportunities",
    },
    {
      label: "Applications",
      value: statsData.appliedCount.toString(),
      icon: BookOpen,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      description: "Scholarships applied",
    },
    {
      label: "Deadlines",
      value: statsData.deadlineCount.toString(),
      icon: Clock,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      description: "Approaching in 30 days",
    },
    {
      label: "Strength",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
      description: "Profile completion",
    },
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-background text-foreground space-y-12 pb-20"
    >
      
      {/* Welcome Section */}
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-lg border border-border/50 bg-card p-8 md:p-12"
      >
        <div 
          className="absolute inset-0 z-0 opacity-40 dark:opacity-20"
          style={{
            backgroundImage: "url('/images/dashboard-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-card/80 via-card/40 to-transparent z-1" />
        
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6"
          >
            <Zap size={14} className="fill-primary" />
            Personalized for you
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 gradient-text">
            Level up your future
          </h1>

          <p className="text-muted-foreground text-lg mb-10 max-w-xl leading-relaxed">
            We've analyzed your profile and found <span className="font-bold text-foreground">{matches.length} matches</span> that align perfectly with your academic journey.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Link href="/dashboard/scholarships">
              <Button size="lg" className="rounded-full px-8 primary-gradient text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform">
                Explore Matches
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/dashboard/student/profile">
              <Button variant="outline" size="lg" className="rounded-full px-8 hover:bg-accent border-border/60 transition-all">
                Update Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      </motion.section>


      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="glass-card hover:scale-[1.02] transition-all duration-300 group overflow-hidden border-none cursor-default">
            <CardBody className="p-6 relative">
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity ${stat.bgColor.replace('/10', '/40')}`} />
              
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bgColor} ${stat.color} transition-transform group-hover:scale-110 duration-500`}>
                  <stat.icon size={22} />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">{stat.label}</span>
                  <p className="text-3xl font-black mt-0.5">{stat.value}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-pulse" />
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </motion.div>


      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

        {/* Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-10">

          {/* Recommended Scholarships */}
          <motion.div variants={item} className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Target className="text-primary" size={24} />
                  Top Recommendations
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Hand-picked opportunities based on your skills and goals.
                </p>
              </div>

              <Link
                href="/dashboard/scholarships"
                className="flex items-center text-sm font-bold text-primary group"
              >
                View all
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loadingMatches ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-[200px] w-full rounded-2xl bg-muted/40 animate-pulse border border-border/50" />
                ))
              ) : matches.length > 0 ? (
                matches.slice(0, 4).map((match) => (
                  <ScholarshipCard key={match.id} scholarship={match} />
                ))
              ) : (
                <Card className="border-dashed border-2 border-border/60 bg-muted/20 col-span-2 rounded-3xl">
                  <CardBody className="py-20 text-center">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Award size={32} className="text-muted-foreground/40" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Building your path...</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed mb-8">
                      {user?.isOnboarded 
                        ? "We're matching you with new opportunities every day. Check back soon for new recommendations!"
                        : "Complete your profile to unlock highly personalized matches and AI-driven recommendations."}
                    </p>
                    <Link href="/dashboard/student/profile">
                      <Button className="rounded-full px-6 primary-gradient text-white shadow-lg shadow-emerald-500/10">
                        {user?.isOnboarded ? "Refine Profile" : "Get Started Now"}
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              )}
            </div>
          </motion.div>

          {/* Quick Matches */}
          <motion.div variants={item} className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <MessageSquare className="text-primary" size={24} />
                  Expert Mentors
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Top-rated consultants matched to your academic field.
                </p>
              </div>

              <Link
                href="/dashboard/counselors"
                className="flex items-center text-sm font-bold text-primary group"
              >
                Browse all
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingCounselors ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-24 w-full rounded-2xl bg-muted/40 animate-pulse" />
                ))
              ) : recommendedCounselors.length > 0 ? (
                recommendedCounselors.slice(0, 4).map((counselor) => (
                  <motion.div 
                    key={counselor.id}
                    whileHover={{ scale: 1.02 }}
                    className="glass-card rounded-2xl border-none p-4 flex items-center gap-4 cursor-pointer"
                  >
                    <Avatar className="h-12 w-12 rounded-xl border border-border/20">
                      <AvatarImage src={counselor.profileImageUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {counselor.name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{counselor.name}</h4>
                      <p className="text-[10px] text-muted-foreground truncate">{counselor.areasOfExpertise || counselor.currentPosition}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[9px] font-bold py-0 h-4 bg-primary/10 text-primary border-none">
                          {Math.round(counselor.recommendationScore)}% Match
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-10 text-center bg-muted/10 rounded-2xl border border-dashed border-border/50 col-span-2">
                  <p className="text-xs text-muted-foreground font-medium">Complete your research preferences to see mentor matches.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar (1/3) */}
        <motion.div variants={item} className="space-y-8">
          
          {/* Profile Strength Card */}
          <Card className="bg-primary/5 dark:bg-primary/10 border-none rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
            
            <CardBody className="p-8 relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-black text-xl mb-1">Profile Strength</h3>
                  <p className="text-xs font-medium text-muted-foreground leading-tight">Complete your profile to <br/>double your match rate.</p>
                </div>
                <div className="text-3xl font-black text-primary">
                  {completionRate}%
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative w-full h-3 bg-card rounded-full overflow-hidden border border-border/20 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full primary-gradient relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-card/50 border border-border/10">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Star size={16} className="fill-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold">Pro Tip</p>
                    <p className="text-[10px] text-muted-foreground">Add your 2024 GPA to reach 100%.</p>
                  </div>
                </div>

                <Link href="/dashboard/student/profile" className="block mt-6">
                  <Button className="w-full rounded-2xl font-bold bg-foreground text-background hover:bg-foreground/90 py-6">
                    Perfect My Profile
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Activity Feed */}
          <div className="space-y-6 px-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ChevronRight className="text-primary" size={18} />
              Recent Updates
            </h3>
            
            <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-border/50 before:z-0">
              
              {!user?.isOnboarded && (
                <div className="flex gap-4 relative z-10">
                  <div className="h-9 w-9 rounded-full bg-amber-500 ring-4 ring-background flex items-center justify-center text-white shrink-0">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Verification Needed</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Upload your transcripts to verify your achievements.</p>
                    <p className="text-[9px] text-muted-foreground/50 mt-2 uppercase font-bold">2h ago</p>
                  </div>
                </div>
              )}

              {user?.isOnboarded && matches.length > 0 && (
                <div className="flex gap-4 relative z-10">
                  <div className="h-9 w-9 rounded-full bg-emerald-500 ring-4 ring-background flex items-center justify-center text-white shrink-0">
                    <Award size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">{matches.length} New Matches</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Found scholarships matching your background in {user?.fieldOfStudy || user?.researchArea || 'your field'}.</p>
                    <p className="text-[9px] text-muted-foreground/50 mt-2 uppercase font-bold">JUST NOW</p>
                  </div>
                </div>
              )}

              {user?.isOnboarded && recommendedCounselors.length > 0 && (
                <div className="flex gap-4 relative z-10">
                  <div className="h-9 w-9 rounded-full bg-sky-500 ring-4 ring-background flex items-center justify-center text-white shrink-0">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Advisor Matches Found</p>
                    <p className="text-[11px] text-muted-foreground mt-1">We've found {recommendedCounselors.length} mentors who can help with your applications.</p>
                    <p className="text-[9px] text-muted-foreground/50 mt-2 uppercase font-bold">JUST NOW</p>
                  </div>
                </div>
              )}

            </div>
          </div>


        </motion.div>

      </div>

    </motion.div>
  );
};
