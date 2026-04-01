"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Scholarship } from "@/features/scholarships/types";
import { getScholarship } from "@/features/scholarships/api/get-scholarships";
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
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ScholarshipDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getScholarship(id as string);
        setScholarship(data);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
        </div>
        <p className="text-muted-foreground animate-pulse text-sm font-medium">
          Analyzing match data...
        </p>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-6">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Scholarship</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          {error || "We couldn't find the scholarship you're looking for."}
        </p>
        <Button onClick={() => router.back()} className="primary-gradient text-white px-8 h-11">
          Go Back
        </Button>
      </div>
    );
  }

  const matchScore = scholarship.matchScore || 0;
  const matchReason = scholarship.matchReason || "This scholarship aligns with your academic profile and preferences.";
  const deadline = scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : "Rolling";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-6">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <div className="p-1 rounded-lg group-hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to list
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1">
                {scholarship.fundType || "Scholarship"}
              </Badge>
              {scholarship.country && (
                <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
                  <MapPin className="h-3 w-3" />
                  {scholarship.country}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {scholarship.title}
            </h1>
          </div>

          <a 
            href={scholarship.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-12 px-8 bg-blue-600 dark:bg-blue-500 text-white font-bold rounded-lg hover:scale-[1.02] active:scale-[0.98] shadow-blue-500/20 transition-all"
          >
            Apply Now
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-5 rounded-lg flex items-start gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-green-500/10 text-green-600 shrink-0">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Amount</p>
                <p className="font-bold text-foreground">{scholarship.amount || "Varies"}</p>
              </div>
            </div>
            
            <div className="bg-card border border-border p-5 rounded-lg flex items-start gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Deadline</p>
                <p className="font-bold text-foreground">{deadline}</p>
              </div>
            </div>

            <div className="bg-card border border-border p-5 rounded-lg flex items-start gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Eligibility</p>
                <p className="font-bold text-foreground text-sm leading-tight line-clamp-2">
                  {scholarship.degreeLevels?.join(", ") || "All Levels"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Description
            </h2>
            <div className="bg-card border border-border p-6 rounded-lg">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {scholarship.description || "No detailed description available for this scholarship."}
              </p>
            </div>
          </section>

          {/* Requirements if available */}
          {scholarship.requirements && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Requirements
              </h2>
              <div className="bg-card border border-border p-6 rounded-lg">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap italic">
                  {scholarship.requirements}
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Right Column: AI Analysis */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border-2 border-primary/20 rounded-lg overflow-hidden shadow-primary/5"
          >
            <div className="primary-gradient p-6 text-white">
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-6">AI Match Analysis</h3>
              
              <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/10">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">{Math.round(matchScore)}</span>
                    <span className="text-xl font-bold opacity-70">%</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-80">Match Probability</p>
                </div>
                
                <div className="relative h-20 w-20 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90">
                    <circle 
                      cx="40" cy="40" r="36" 
                      fill="transparent" 
                      stroke="rgba(255,255,255,0.2)" 
                      strokeWidth="6" 
                    />
                    <circle 
                      cx="40" cy="40" r="36" 
                      fill="transparent" 
                      stroke="white" 
                      strokeWidth="6" 
                      strokeDasharray={2 * Math.PI * 36}
                      strokeDashoffset={2 * Math.PI * 36 * (1 - matchScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <CheckCircle2 className="absolute h-8 w-8 text-white" />
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Why this matches you</h4>
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <p className="text-sm text-foreground leading-relaxed italic">
                    "{matchReason}"
                  </p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <p className="text-[11px] text-primary/80 leading-relaxed font-medium">
                  Matches your interest in <strong>{scholarship.country || 'International'}</strong> studies and <strong>{scholarship.fundType || 'Fully Funded'}</strong> opportunities.
                </p>
              </div>

              <div className="pt-2">
                <a 
                  href={scholarship.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 w-full py-4 rounded-lg border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Confirm & Apply
                  <ExternalLink className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
                <p className="text-[10px] text-center text-muted-foreground mt-4">
                  Official website: {new URL(scholarship.originalUrl).hostname}
                </p>
              </div>
            </div>
          </motion.div>

          <Card className="rounded-lg border-border bg-muted/30">
            <CardBody className="p-6">
              <h4 className="font-bold text-foreground mb-4">Tips for Application</h4>
              <ul className="space-y-3">
                {[
                  "Highlight your field of study in your SOP",
                  "Prepare transcripts in PDF format",
                  "Mention your English proficiency scores",
                  "Check for intake seasons for " + (scholarship.intakeSeason || "2024/25")
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-xs text-muted-foreground leading-relaxed">
                    <span className="h-4 w-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] shrink-0">{i+1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
