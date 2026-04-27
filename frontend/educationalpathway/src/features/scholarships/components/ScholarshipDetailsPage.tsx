"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Scholarship } from "@/features/scholarships/types";
import { getScholarship } from "@/features/scholarships/api/get-scholarships";
import { useAuth } from "@/providers/auth-context";
import { 
  Button, 
  Card, 
  CardBody, 
  Badge
} from "@/components/ui";
import {
  Loader2, 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  GraduationCap, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  Zap,
  Check,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Globe2
} from "lucide-react";
import { motion } from "framer-motion";
import { trackScholarship, untrackScholarship, updateScholarshipStatus } from "../api/tracking";
import { toast } from "react-hot-toast";

interface CriteriaMatch {
  label: string;
  studentValue: string;
  requiredValue: string;
  isMatched: boolean;
  icon: any;
}

const safeString = (val: any) => {
  if (Array.isArray(val)) return val.join(", ");
  return val || "";
};

export default function ScholarshipDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<{ id: number; status: string } | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getScholarship(id as string);
        setScholarship(data);
        setTrackingInfo(data.tracking || null);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch scholarship details:", err);
        setError("Failed to load scholarship details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const matchingCriteria = useMemo(() => {
    if (!scholarship || !user) return [];

    const criteria: CriteriaMatch[] = [];

    // Helper to extract values from stringified JSON or arrays
    const extractValues = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // not json
        }
        return [val];
      }
      return [];
    };

    const normalize = (str: string) => str.toLowerCase().replace(/['"\[\]]/g, '').trim();

    // 1. Degree Level Match
    const studentDegrees = [
      ...extractValues(user.preferredDegreeLevel),
      ...extractValues(user.degreeSeeking)
    ].map(normalize);
    
    const scholarshipDegrees = (scholarship.degreeLevels || []).map(normalize);
    const degreeMatch = scholarshipDegrees.length === 0 || scholarshipDegrees.some(d => 
      studentDegrees.some(s => s.includes(d) || d.includes(s) || s.replace('s', '') === d.replace('s', ''))
    );
    
    criteria.push({
      label: "Degree Level",
      studentValue: safeString(extractValues(user.preferredDegreeLevel)) || safeString(user.degreeSeeking) || "Any Level",
      requiredValue: scholarship.degreeLevels?.join(", ") || "All Levels",
      isMatched: degreeMatch,
      icon: GraduationCap
    });

    // 2. Country Match
    const studentCountries = extractValues(user.preferredCountries).map(normalize);
    const scholarshipCountry = normalize(scholarship.country || "");
    const countryMatch = !scholarship.country || studentCountries.some(c => 
      c.includes(scholarshipCountry) || scholarshipCountry.includes(c) ||
      (c === 'usa' && scholarshipCountry.includes('united states')) ||
      (scholarshipCountry === 'usa' && c.includes('united states'))
    );

    criteria.push({
      label: "Location",
      studentValue: safeString(extractValues(user.preferredCountries)) || "Global",
      requiredValue: scholarship.country || "International",
      isMatched: countryMatch,
      icon: MapPin
    });

    // 3. GPA Match
    const studentGpa = parseFloat(user.gpa || user.calculatedGpa || "0");
    const hasGpaReq = scholarship.requirements?.toLowerCase().includes("gpa");
    const gpaMatch = !hasGpaReq || studentGpa >= 3.0; // If no GPA req, then it's a match!

    criteria.push({
      label: "Academic",
      studentValue: studentGpa > 0 ? `GPA: ${studentGpa}` : "N/A",
      requiredValue: hasGpaReq ? "Required" : "Flexible",
      isMatched: gpaMatch,
      icon: Target
    });

    // 4. Funding Type
    const studentFunding = [...extractValues(user.preferredFundingType), ...extractValues(user.fundingRequirement)].map(normalize);
    const scholarshipFunding = normalize(scholarship.fundType || "");
    const fundingMatch = !scholarshipFunding || studentFunding.length === 0 || studentFunding.some(f => 
      f.includes(scholarshipFunding) || scholarshipFunding.includes(f) ||
      (f.includes('fully') && scholarshipFunding.includes('full'))
    );

    criteria.push({
      label: "Funding",
      studentValue: safeString(extractValues(user.preferredFundingType)) || safeString(user.fundingRequirement) || "Any",
      requiredValue: scholarship.fundType || "Grant",
      isMatched: fundingMatch,
      icon: DollarSign
    });

    return criteria;
  }, [scholarship, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Analyzing Match Analysis...</p>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 space-y-6">
        <div className="p-4 rounded-xl bg-destructive/5 text-destructive border border-destructive/10">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Scholarship Not Found</h2>
        <Button onClick={() => router.back()} variant="outline" className="rounded-xl px-10 h-12 font-bold transition-all hover:bg-muted">
          Return to Explorer
        </Button>
      </div>
    );
  }

  const matchScore = Math.round(scholarship.matchScore || 0);
  const deadline = scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Rolling";

  const getMatchInfo = (score: number) => {
    if (score >= 85) return { label: "High Compatibility", description: "Highly Recommended", color: "text-emerald-500", bgColor: "bg-emerald-500/10", icon: TrendingUp };
    if (score >= 65) return { label: "Good Match", description: "Recommended", color: "text-primary", bgColor: "bg-primary/10", icon: CheckCircle2 };
    if (score >= 40) return { label: "Moderate Match", description: "Potential Fit", color: "text-orange-500", bgColor: "bg-orange-500/10", icon: Zap };
    return { label: "Low Compatibility", description: "Consider Requirements", color: "text-destructive", bgColor: "bg-destructive/10", icon: TrendingDown };
  };

  const matchInfo = getMatchInfo(matchScore);

  const handleToggleSave = async () => {
    if (!scholarship || isActionLoading) return;
    setIsActionLoading(true);
    try {
      if (trackingInfo) {
        await untrackScholarship(scholarship.id);
        setTrackingInfo(null);
        toast.success("Scholarship removed from watchlist");
      } else {
        const res = await trackScholarship(scholarship.id);
        const newTracking = res.status === 'success' ? res.data : res;
        setTrackingInfo({ id: newTracking.id, status: newTracking.status });
        toast.success("Scholarship saved to watchlist");
      }
    } catch (err) {
      toast.error("Failed to update watchlist");
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBeginApplication = async () => {
    if (!scholarship || isActionLoading) return;
    
    // Open URL first to be responsive
    if (scholarship.originalUrl) {
      window.open(scholarship.originalUrl, '_blank');
    }

    setIsActionLoading(true);
    try {
      let currentTracking = trackingInfo;
      
      // If not tracked yet, track it first
      if (!currentTracking) {
        const res = await trackScholarship(scholarship.id);
        currentTracking = res.status === 'success' ? res.data : res;
        setTrackingInfo(currentTracking);
      }

      // If tracked but not applied, update status to APPLIED
      if (currentTracking && currentTracking.status !== 'APPLIED') {
        const res = await updateScholarshipStatus(currentTracking.id, 'APPLIED');
        const updated = res.status === 'success' ? res.data : res;
        setTrackingInfo({ id: updated.id, status: updated.status });
      }
    } catch (err) {
      console.error("Failed to update application status", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 px-4 sm:px-6">
      
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-all uppercase tracking-widest"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to list
        </button>

        <Badge variant="outline" className="bg-muted text-muted-foreground border-border/60 font-black text-[9px] tracking-widest uppercase py-1 px-3 rounded-md">
          REF: #{scholarship.id}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14">
        
        {/* Left Column: Principal Scholarship Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="lg:col-span-8 space-y-12"
        >
          
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
               <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] tracking-widest uppercase px-3 py-1">
                 {scholarship.fundType || "Full Scholarship"}
               </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.1] text-balance">
              {scholarship.title}
            </h1>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50">
                 <MapPin size={14} className="text-primary" />
                 <span className="text-xs font-bold">{scholarship.country || "Global"}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                 <Calendar size={14} className="text-emerald-500" />
                 <span className="text-xs font-bold text-emerald-600">Deadline: {deadline}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-sm transition-all hover:bg-muted/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3">Award Value</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <DollarSign size={18} />
                  </div>
                  <p className="text-xl font-black text-foreground truncate">{scholarship.amount || "Varies"}</p>
                </div>
             </div>
             <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-sm transition-all hover:bg-muted/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3">Study Level</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <GraduationCap size={18} />
                  </div>
                  <p className="text-xl font-black text-foreground truncate">{scholarship.degreeLevels?.[0] || "All"}</p>
                </div>
             </div>
             <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-sm transition-all hover:bg-muted/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3">Intake</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Clock size={18} />
                  </div>
                  <p className="text-xl font-black text-foreground truncate">{scholarship.intakeSeason || "2024/25"}</p>
                </div>
             </div>
          </div>

          {/* Criteria Matching Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-xs font-black text-foreground uppercase tracking-widest">Eligibility Breakdown</h2>
              <span className="text-[10px] font-bold text-muted-foreground/40 italic">Live Comparison</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {matchingCriteria.map((c, i) => (
                  <div key={i} className={`p-5 rounded-2xl border transition-all duration-300 ${c.isMatched ? 'border-emerald-500/2 bg-emerald-500/2' : 'border-border/50 bg-card hover:bg-muted/20'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${c.isMatched ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground shadow-xs'}`}>
                          <c.icon size={16} />
                        </div>
                        <span className="text-xs font-black text-foreground tracking-tight">{c.label}</span>
                      </div>
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center ${c.isMatched ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                         {c.isMatched ? <Check size={10} strokeWidth={4} /> : <span className="text-[8px] font-bold">!</span>}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Scholarship Needs</p>
                        <p className="text-xs font-bold text-foreground truncate" title={c.requiredValue}>{c.requiredValue}</p>
                      </div>
                      <div className="min-w-0 text-right border-l border-border/30 pl-4">
                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1 text-right">You</p>
                        <p className={`text-xs font-bold truncate ${c.isMatched ? 'text-emerald-600' : 'text-foreground/60'}`} title={c.studentValue}>{c.studentValue}</p>
                      </div>
                    </div>
                  </div>
               ))}
            </div>
          </div>

          {/* Content sections */}
          <div className="space-y-12">
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                 <h3 className="text-sm font-black uppercase tracking-widest text-foreground/40">Description</h3>
                 <div className="flex-1 h-px bg-border/40" />
              </div>
              <div className="text-base text-muted-foreground leading-relaxed text-balance">
                {scholarship.description || "The scholarship provider has not yet listed a full detailed description."}
              </div>
            </section>

            {scholarship.requirements && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                   <h3 className="text-sm font-black uppercase tracking-widest text-foreground/40">Requirements</h3>
                   <div className="flex-1 h-px bg-border/40" />
                </div>
                <div className="p-8 rounded-2xl bg-muted/40 border border-border/50 font-medium text-foreground italic leading-[1.8] text-sm">
                  "{scholarship.requirements}"
                </div>
              </section>
            )}
          </div>
        </motion.div>

        {/* Right Column: AI Score & Action Container */}
        <div className="lg:col-span-4 lg:relative">
           <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             className="sticky top-24 space-y-6"
           >
              {/* Refactored AI Match Card */}
              <div className="bg-card border border-border/80 shadow-2xl shadow-primary/5 rounded-4xl p-8 space-y-10 overflow-hidden group">
                 <div className={`absolute top-0 right-0 w-32 h-32 ${matchInfo.bgColor} rounded-full blur-3xl -mr-16 -mt-16 transition-colors duration-500`} />
                 
                 <div className="space-y-3 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[4px]">Match Probability</p>
                       <div className="flex items-center justify-center gap-2">
                          <matchInfo.icon size={16} className={matchInfo.color} />
                          <span className={`${matchInfo.color} text-xs font-black uppercase tracking-widest`}>{matchInfo.label}</span>
                       </div>
                    </div>
                    
                    <div className="text-8xl font-black text-foreground tracking-tighter flex items-center justify-center gap-1 group-hover:scale-105 transition-transform">
                       {matchScore}
                       <span className={`text-2xl font-bold ${matchInfo.color}`}>%</span>
                    </div>

                    <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full ${matchInfo.bgColor} ${matchInfo.color} text-[10px] font-black uppercase tracking-widest border border-current opacity-30`}>
                       {matchInfo.description}
                    </div>
                 </div>

                 {/* Match Progress Gauge */}
                 <div className="space-y-2">
                    <div className="h-3 w-full bg-muted rounded-full p-[3px] border border-border/20 shadow-inner">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${matchScore}%` }}
                         transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                         className={`h-full rounded-full shadow-lg ${matchScore >= 85 ? 'bg-emerald-500 shadow-emerald-500/20' : matchScore >= 40 ? 'bg-primary shadow-primary/20' : 'bg-destructive shadow-destructive/20'}`}
                       />
                    </div>
                 </div>

                 <div className="bg-muted px-6 py-5 rounded-2xl border border-border/40 relative">
                    <Zap className="absolute -top-2 -right-2 h-6 w-6 text-primary fill-primary/20 p-1 bg-card rounded-lg border border-border/40" />
                    <p className="text-xs font-bold text-foreground/80 leading-relaxed italic text-balance text-center">
                       "{scholarship.matchReason || "Our AI recommends this opportunity based on your strategic field of focus and location preference."}"
                    </p>
                 </div>

                 <div className="space-y-4 pt-4">
                    <Button 
                      onClick={handleBeginApplication}
                      disabled={isActionLoading}
                      className="flex items-center justify-center gap-4 w-full h-16 primary-gradient text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
                    >
                      {trackingInfo?.status === 'APPLIED' ? 'VIEW APPLICATION' : 'BEGIN APPLICATION'}
                      <ExternalLink size={18} />
                    </Button>
                    
                    <button 
                      onClick={handleToggleSave}
                      disabled={isActionLoading}
                      className={`w-full h-16 rounded-2xl border border-border/80 text-xs font-black uppercase tracking-widest hover:bg-muted transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${trackingInfo ? 'bg-primary/5 border-primary/20 text-primary' : ''}`}
                    >
                      {trackingInfo ? (
                        <>
                          <BookmarkCheck size={18} className="fill-primary" />
                          OPPORTUNITY SAVED
                        </>
                      ) : (
                        <>
                          <Bookmark size={18} />
                          SAVE OPPORTUNITY
                        </>
                      )}
                    </button>
                 </div>

                 <p className="text-[9px] text-center text-muted-foreground/40 font-bold uppercase tracking-wider pt-2 flex items-center justify-center gap-2 opacity-50">
                    <CheckCircle2 size={10} /> Verified Enrollment Link
                 </p>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
}
