"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  BookOpen,
  Headphones,
  PenLine,
  Mic,
  TrendingUp,
  Award,
  Sparkles,
  BarChart3,
  BookMarked,
  Map,
  List,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { getAssessmentResult } from "../api/assessment-api";
import { LearningPathView } from "@/features/english-learning/components/LearningPath/LearningPathView";

interface AssessmentResultViewProps {
  testId: string;
  examType: string;
  difficulty: string;
  onBack: () => void;
}

const sectionIcons: Record<string, React.ReactNode> = {
  Reading: <BookOpen className="size-4" />,
  Listening: <Headphones className="size-4" />,
  Writing: <PenLine className="size-4" />,
  Speaking: <Mic className="size-4" />,
};

const difficultyColors: Record<string, string> = {
  Hard: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-warning/10 text-warning border-warning/20",
  Easy: "bg-success/10 text-success border-success/20",
};

function normalizeAssessmentResult(payload: any) {
  if (!payload) return null;
  if (
    payload.evaluation ||
    payload.overall_band !== undefined ||
    payload.feedback_report
  ) {
    return payload;
  }
  if (
    payload.data &&
    (payload.data.evaluation ||
      payload.data.overall_band !== undefined ||
      payload.data.feedback_report)
  ) {
    return payload.data;
  }
  return payload;
}

export function AssessmentResultView({
  testId,
  examType,
  difficulty,
  onBack,
}: AssessmentResultViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await getAssessmentResult(testId);
        const normalized = normalizeAssessmentResult(res);
        if (normalized?.status === "failed") {
          setError(
            `Evaluation failed: ${normalized.reason || "Unknown error"}`,
          );
        } else if (normalized) {
          setResultData(normalized);
        } else {
          setError("Result not found or still processing.");
        }
      } catch (err: any) {
        setError("Could not load result. The result may have expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [testId]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary size-10" />
        <p className="text-muted-foreground">Loading result...</p>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-destructive/10 rounded-full">
          <AlertCircle className="size-10 text-destructive" />
        </div>
        <h2 className="h3">Result Unavailable</h2>
        <p className="text-muted-foreground">
          {error ||
            "This result has expired from the cache. Complete a new assessment to track progress."}
        </p>
        <Button onClick={onBack} variant="outline" className="px-8">
          <ArrowLeft className="mr-2 size-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const isTOEFL = examType === "TOEFL";
  const maxScore = isTOEFL ? 120 : 9;
  const maxSectionScore = isTOEFL ? 30 : 9;
  const threshold = isTOEFL ? 90 : 6.5;

  const evaluation = resultData.evaluation || resultData;
  const subs = evaluation.score_breakdown || {};
  const band = parseFloat(evaluation.overall_band || 0);
  const bandPercent = Math.min(100, (band / maxScore) * 100);

  const subscoredItems = [
    { name: "Reading", val: subs.reading },
    { name: "Listening", val: subs.listening },
    { name: "Writing", val: subs.writing },
    { name: "Speaking", val: subs.speaking },
  ];

  const getBandColor = (b: number) => {
    if (isTOEFL) {
      if (b >= 100) return "text-success";
      if (b >= 85) return "text-primary";
      if (b >= 70) return "text-warning";
      return "text-destructive";
    }
    if (b >= 7.5) return "text-success";
    if (b >= 6.5) return "text-primary";
    if (b >= 5.5) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="size-4" /> Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="h3">{examType} Assessment Result</h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${difficultyColors[difficulty] || "bg-muted text-muted-foreground"}`}
            >
              {difficulty}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Test ID: {testId.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Score Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border border-border h-full">
            <CardBody className="p-8 flex flex-col items-center justify-center text-center bg-linear-to-br from-primary/5 to-accent/5">
              <div className="inline-flex items-center justify-center p-3 bg-success/10 rounded-full mb-4">
                <CheckCircle2 className="size-8 text-success" />
              </div>
              <p className="text-label text-muted-foreground mb-2">
                Overall {isTOEFL ? "Score" : "Band Score"}
              </p>
              <h2 className={`text-7xl font-black ${getBandColor(band)}`}>
                {evaluation.overall_band || "0"}
              </h2>
              <p className="text-sm text-muted-foreground mt-3">out of {maxScore}</p>

              {/* Progress bar */}
              <div className="w-full mt-5 bg-muted h-2.5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-primary to-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${bandPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {bandPercent.toFixed(0)}% of target {isTOEFL ? "score" : "band"} {maxScore}
              </p>
            </CardBody>
          </Card>
        </motion.div>

        {/* Subscores */}
        <Card className="border border-border">
          <CardBody className="p-6">
            <h3 className="font-bold mb-5 flex items-center gap-2">
              <TrendingUp className="text-primary size-5" /> Section Breakdown
            </h3>
            <div className="space-y-5">
              {subscoredItems.map((s, idx) => {
                const val = parseFloat(s.val || 0);
                const pct = Math.min(100, (val / maxSectionScore) * 100);
                return (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                  >
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        {sectionIcons[s.name]}
                        {s.name}
                      </span>
                      <span
                        className={`font-bold text-base ${getBandColor(val)}`}
                      >
                        {s.val || "—"}
                      </span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.15 * idx }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Scholarship Goal */}
      {band >= threshold && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border border-success/30 bg-success/5">
            <CardBody className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/15 rounded-lg">
                  <Award className="size-6 text-success" />
                </div>
                <div>
                  <p className="font-bold text-success">
                    Scholarship Threshold Achieved! 🎉
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your {isTOEFL ? "score" : "band score"} of {evaluation.overall_band} meets the {threshold}+
                    threshold required for most scholarships.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Feedback Report */}
      <Card className="border border-border">
        <CardBody className="p-6">
          <h3 className="h4 mb-4 flex items-center gap-2">
            <Sparkles className="text-primary size-5" /> AI Feedback Report
          </h3>
          <div className="prose prose-sm max-w-none text-foreground bg-muted/30 p-6 rounded-lg border border-border/50">
            <p className="whitespace-pre-wrap leading-relaxed text-sm">
              {evaluation.feedback_report || "No detailed feedback available."}
            </p>
          </div>

          {evaluation.adaptive_learning_tags &&
            evaluation.adaptive_learning_tags.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="size-4 text-warning" /> Areas to
                  Improve
                </h4>
                <div className="flex flex-wrap gap-2">
                  {evaluation.adaptive_learning_tags.map(
                    (tag: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-destructive/10 text-destructive text-sm rounded-full font-medium border border-destructive/15"
                      >
                        {tag.replace(/_/g, " ")}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
        </CardBody>
      </Card>

      {/* Competency Gap Analysis */}
      {evaluation.competency_gap_analysis && (
        <Card className="border border-primary/20 bg-linear-to-br from-background to-primary/5">
          <CardBody className="p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
               <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="size-5 text-primary" />
               </div>
               <div>
                  <h3 className="font-bold">Competency Gap Analysis</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Diagnostic Profile</p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="p-4 bg-muted/30 rounded-xl border border-border/50 italic text-sm leading-relaxed">
                  "{evaluation.competency_gap_analysis.proficiency_profile}"
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {evaluation.competency_gap_analysis.section_analysis && 
                    Object.entries(evaluation.competency_gap_analysis.section_analysis).map(([skill, analysis]: [any, any]) => (
                     <div key={skill} className="p-4 rounded-xl border border-border bg-card">
                        <p className="font-bold text-xs uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                           {sectionIcons[skill.charAt(0).toUpperCase() + skill.slice(1)]} {skill}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{analysis}</p>
                     </div>
                  ))}
               </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Specialized Section Notes (Ethiopian Context) */}
      {evaluation.section_notes && (
        <Card className="border border-info/20">
          <CardBody className="p-6">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-info/10 rounded-lg text-info">
                  <BookMarked className="size-5" />
               </div>
               <h3 className="font-bold">Skill-Specific Actionable Notes</h3>
            </div>
            
            <div className="space-y-4">
               {Object.entries(evaluation.section_notes).map(([skill, note]: [any, any]) => (
                  <div key={skill} className="flex gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border">
                     <div className="shrink-0 pt-1">
                        {sectionIcons[skill.charAt(0).toUpperCase() + skill.slice(1)]}
                     </div>
                     <div>
                        <p className="font-bold text-sm uppercase tracking-widest mb-1">{skill}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{note}</p>
                     </div>
                  </div>
               ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Adaptive Curriculum map */}
      {evaluation.adaptive_curriculum_map && (
        <div className="space-y-6">
           <div className="flex items-center gap-3 px-2">
              <Map className="size-5 text-accent" />
              <h3 className="h4">Personalized Curriculum Matrix</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Sprints */}
              <div className="md:col-span-3 space-y-4">
                 {evaluation.adaptive_curriculum_map.sprints?.map((sprint: any, i: number) => (
                    <Card key={i} className={`border border-border ${sprint.is_remedial ? 'bg-destructive/5 border-destructive/20' : ''}`}>
                       <CardBody className="p-5 flex gap-4">
                          <div className="flex flex-col items-center gap-2">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${sprint.is_remedial ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                W{sprint.week}
                             </div>
                             {sprint.is_remedial && <span className="text-[8px] font-bold text-destructive uppercase tracking-widest">Remedial</span>}
                          </div>
                          <div className="space-y-2 flex-1">
                             <p className="font-bold text-sm">{sprint.goal}</p>
                             <ul className="space-y-1">
                                {sprint.tasks?.map((task: string, j: number) => (
                                   <li key={j} className="text-xs text-muted-foreground flex items-center gap-2">
                                      <div className="size-1 bg-muted-foreground/30 rounded-full" /> {task}
                                   </li>
                                ))}
                             </ul>
                          </div>
                       </CardBody>
                    </Card>
                 ))}
              </div>

              {/* Vocab Packs */}
              <div className="md:col-span-2 space-y-4">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest px-2 text-muted-foreground opacity-50">Target Vocabulary</h4>
                 {evaluation.adaptive_curriculum_map.vocabulary_packs?.map((pack: any, i: number) => (
                    <Card key={i} className="border border-border bg-card">
                       <CardBody className="p-4 space-y-3">
                          <p className="text-xs font-bold border-b border-border pb-2">{pack.topic}</p>
                          <div className="space-y-3">
                             {pack.words?.map((w: any, j: number) => (
                                <div key={j} className="space-y-0.5">
                                   <p className="text-xs font-bold text-primary">{w.word}</p>
                                   <p className="text-[10px] text-muted-foreground leading-tight">{w.meaning}</p>
                                   <p className="text-[9px] italic text-muted-foreground/60">"{w.example}"</p>
                                </div>
                             ))}
                          </div>
                       </CardBody>
                    </Card>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Personalized Learning Path */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <LearningPathView />
      </motion.div>
    </div>
  );
}
