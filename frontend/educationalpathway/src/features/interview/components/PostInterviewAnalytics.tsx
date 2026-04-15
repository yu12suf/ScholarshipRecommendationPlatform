"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  FileText,
  Star,
  Zap,
  Loader2,
  Play,
  RotateCcw,
  ListRestart,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { getVisaInterviewAnalysis } from "../api/visa-api";

interface PostInterviewAnalyticsProps {
  interviewId: string;
  onRestart: () => void;
}

type AnyRecord = Record<string, unknown>;

const EVALUATION_CONTAINER_KEYS = [
  "aiEvaluation",
  "ai_evaluation",
  "evaluation",
  "result",
  "analysis",
  "report",
  "feedback",
];

const unwrapJsonCodeFence = (raw: string) => {
  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fencedMatch ? fencedMatch[1].trim() : raw.trim();
};

const parseMaybeJson = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  const cleaned = unwrapJsonCodeFence(value);
  if (!cleaned) return null;

  try {
    return JSON.parse(cleaned);
  } catch {
    return value;
  }
};

const asRecord = (value: unknown): AnyRecord | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as AnyRecord;
};

const firstNonEmptyText = (...values: unknown[]): string | null => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : String(item ?? "").trim()))
    .filter(Boolean);
};

const toScore = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(10, Math.round(parsed)));
};

const findNestedEvaluation = (root: unknown): AnyRecord | null => {
  const seen = new Set<unknown>();
  const stack: unknown[] = [root];

  while (stack.length > 0) {
    const current = parseMaybeJson(stack.pop());
    if (!current || seen.has(current)) continue;
    seen.add(current);

    const currentRecord = asRecord(current);
    if (!currentRecord) continue;

    const hasEvaluationSignals =
      currentRecord.confidence_score !== undefined ||
      currentRecord.rubric_breakdown !== undefined ||
      currentRecord.detailed_feedback !== undefined ||
      currentRecord.country_specific_flags !== undefined ||
      currentRecord.focus_areas !== undefined ||
      currentRecord.improvements !== undefined;

    if (hasEvaluationSignals) {
      return currentRecord;
    }

    for (const key of EVALUATION_CONTAINER_KEYS) {
      if (currentRecord[key] !== undefined) {
        stack.push(currentRecord[key]);
      }
    }

    for (const child of Object.values(currentRecord)) {
      if (child && typeof child === "object") {
        stack.push(child);
      }
      if (typeof child === "string" && (child.includes("{") || child.includes("```"))) {
        stack.push(child);
      }
    }
  }

  return null;
};

const normalizeInterviewEvaluation = (interview: unknown) => {
  const interviewRecord = asRecord(interview);
  if (!interviewRecord) return null;

  const evaluationRecord =
    findNestedEvaluation(interviewRecord.aiEvaluation) ||
    findNestedEvaluation(interviewRecord.evaluation) ||
    findNestedEvaluation(interviewRecord);

  if (!evaluationRecord) return null;

  const rubricInput = asRecord(evaluationRecord.rubric_breakdown) ||
    asRecord((evaluationRecord as AnyRecord).rubricBreakdown) ||
    asRecord((evaluationRecord as AnyRecord).scores);

  const rubricBreakdown: Record<string, number> = {};
  if (rubricInput) {
    for (const [key, value] of Object.entries(rubricInput)) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        rubricBreakdown[key] = toScore(parsed);
      }
    }
  }

  return {
    confidence_score: toScore(
      evaluationRecord.confidence_score ??
        (evaluationRecord as AnyRecord).confidenceScore ??
        (evaluationRecord as AnyRecord).overall_score ??
        (evaluationRecord as AnyRecord).score,
    ),
    detailed_feedback: firstNonEmptyText(
      evaluationRecord.detailed_feedback,
      (evaluationRecord as AnyRecord).detailedFeedback,
      (evaluationRecord as AnyRecord).feedback,
      (evaluationRecord as AnyRecord).summary,
      (evaluationRecord as AnyRecord).comment,
    ) || "Evaluation data received. Keep practicing to improve your interview readiness.",
    evaluation_source: firstNonEmptyText(
      evaluationRecord.evaluation_source,
      (evaluationRecord as AnyRecord).evaluationSource,
      (evaluationRecord as AnyRecord).source,
      (evaluationRecord as AnyRecord).provider,
      "vapi",
    ),
    rubric_breakdown: rubricBreakdown,
    country_specific_flags: toStringArray(
      evaluationRecord.country_specific_flags ??
        (evaluationRecord as AnyRecord).countrySpecificFlags ??
        (evaluationRecord as AnyRecord).red_flags,
    ),
    focus_areas: toStringArray(
      evaluationRecord.focus_areas ??
        (evaluationRecord as AnyRecord).focusAreas ??
        (evaluationRecord as AnyRecord).strengths,
    ),
    improvements: toStringArray(
      evaluationRecord.improvements ??
        (evaluationRecord as AnyRecord).improvement_areas ??
        (evaluationRecord as AnyRecord).recommendations,
    ),
  };
};

const isFinalStatus = (status: unknown) => {
  if (typeof status !== "string") return false;
  const normalized = status.trim().toLowerCase();
  return ["evaluated", "completed", "complete", "done", "finalized", "failed", "error"].includes(normalized);
};

export function PostInterviewAnalytics({ interviewId, onRestart }: PostInterviewAnalyticsProps) {
  const [interview, setInterview] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 40; // ~2 minutes

    async function fetchStatus() {
      try {
        attempts += 1;
        const res = await getVisaInterviewAnalysis(interviewId);
        const data = res?.status === "success" ? res.data : res;
        
        // Use the returned evaluation or analysis objects for normalization
        const normalizedEvaluation = normalizeInterviewEvaluation(data);
        const rawStatus = typeof data?.interviewStatus === "string" ? data.interviewStatus : 
                          (typeof data?.status === "string" ? data.status : "");
        const normalizedStatus = rawStatus.trim().toLowerCase();
        
        // We consider it evaluated if the backend explicitly says it's ready, or manually check the content
        if (data?.ready || normalizedStatus === "evaluated" || (isFinalStatus(rawStatus) && !!normalizedEvaluation)) {
          setInterview(data);
          setLoading(false);
          setErrorMessage(null);
          clearInterval(pollInterval);
          return;
        }

        if (normalizedStatus === "failed" || normalizedStatus === "error") {
          setInterview(data);
          setLoading(false);
          setErrorMessage(
            normalizedEvaluation?.detailed_feedback ||
              "Interview evaluation failed. Please restart and try again.",
          );
          clearInterval(pollInterval);
          return;
        }

        if (attempts >= maxAttempts) {
          setInterview(data);
          setLoading(false);
          setErrorMessage("Evaluation is taking too long. Check back soon or restart the interview.");
          clearInterval(pollInterval);
        } else {
          setInterview(data);
        }
      } catch (err) {
        console.error("Failed to fetch status", err);
        if (attempts >= maxAttempts) {
           setLoading(false);
           setErrorMessage("Unable to fetch interview status. Please restart the interview.");
           clearInterval(pollInterval);
        }
      }
    }

    fetchStatus();
    pollInterval = setInterval(fetchStatus, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [interviewId]);

  const currentStatus = interview?.interviewStatus || interview?.status;

  if (loading && currentStatus !== "Evaluated" && !interview?.ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-8">
        <div className="relative">
          <div className="absolute -inset-10 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <Loader2 className="animate-spin text-primary size-12 relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black italic uppercase tracking-tight">AI Officer Reviewing...</h2>
          <p className="text-muted-foreground font-medium max-w-sm">
            Our Consular evaluator is analyzing your responses, confidence levels, and speaking consistency.
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-6 px-4 text-center">
        <AlertTriangle className="text-amber-500" size={36} />
        <h2 className="text-3xl font-black italic uppercase tracking-tight">Evaluation Delayed</h2>
        <p className="text-muted-foreground font-medium max-w-lg">{errorMessage}</p>
        <div className="flex gap-3">
          <Button onClick={onRestart} variant="outline">Start New Session</Button>
          <Button onClick={() => window.location.reload()}>Retry Status</Button>
        </div>
      </div>
    );
  }

  const evaluation = normalizeInterviewEvaluation(interview);
  const score = evaluation?.confidence_score || 0;
  const rubricBreakdown =
    evaluation?.rubric_breakdown && typeof evaluation.rubric_breakdown === "object"
      ? (evaluation.rubric_breakdown as Record<string, number>)
      : null;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Score Header */}
      <div className="relative rounded-[4rem] overflow-hidden bg-background shadow-2xl border-4 border-primary/20 p-12 lg:p-20 text-center">
        <div className="absolute inset-0 primary-gradient opacity-5 pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
            <TrendingUp size={14} /> Official Performance Report
          </div>
          {evaluation?.evaluation_source && (
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-primary/80">
              Evaluator: {String(evaluation.evaluation_source).replace(/_/g, " ")}
            </div>
          )}
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter">
            Interview <span className="text-primary italic">Result</span>
          </h1>
          
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative flex items-center justify-center">
              {/* Score Circle Progress (Decoration) */}
              <svg className="size-48 lg:size-64 transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/10" />
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="100 100" strokeDashoffset={100 - (score * 10)} className="text-primary" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-7xl lg:text-9xl font-black text-primary">{score}</span>
                <span className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Confidence Score</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <Star key={i} size={16} className={`${i <= score ? 'text-amber-400 fill-amber-400' : 'text-muted/20'}`} />
              ))}
            </div>
          </div>

          <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium italic">
            &quot;{evaluation?.detailed_feedback || "The interview was conducted in a professional manner with clear responses provided throughout."}&quot;
          </p>

          {rubricBreakdown && Object.keys(rubricBreakdown).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4">
              {Object.entries(rubricBreakdown).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-3 text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="text-xl font-black text-primary mt-1">{Math.max(1, Math.min(10, Math.round(Number(value) || 0)))}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Red Flags / Improvements */}
        <div className="space-y-6">
           <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-2 flex items-center gap-2">
             <AlertTriangle size={14} className="text-amber-500" /> Critical Red Flags
           </h3>
           <div className="grid gap-3">
             {(evaluation?.country_specific_flags || []).map((flag: string, i: number) => (
               <div key={i} className="p-5 rounded-2xl bg-amber-500/5 border-2 border-amber-500/10 flex items-start gap-4">
                  <Zap className="text-amber-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm font-bold text-amber-900/80 leading-relaxed">{flag}</p>
               </div>
             ))}
             {(!evaluation?.country_specific_flags || evaluation.country_specific_flags.length === 0) && (
               <div className="p-5 rounded-2xl bg-success/5 border-2 border-success/10 flex items-start gap-4">
                  <CheckCircle2 className="text-success shrink-0 mt-0.5" size={18} />
                  <p className="text-sm font-bold text-success/80">No significant red flags detected in this session.</p>
               </div>
             )}
           </div>

           <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-2 flex items-center gap-2 pt-4">
             <Lightbulb size={14} className="text-primary" /> Key Strengths
           </h3>
           <div className="grid gap-3">
             {(evaluation?.focus_areas || []).map((area: string, i: number) => (
               <div key={i} className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                  <div className="size-2 rounded-full bg-primary" />
                  <span className="text-sm font-bold text-foreground/80">{area}</span>
               </div>
             ))}
           </div>
        </div>

        {/* Simulation Summary */}
        <div className="space-y-6">
           <Card className="border-none bg-muted/20 rounded-[3rem] h-full">
             <CardBody className="p-8 lg:p-12 space-y-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText size={14} className="text-primary" /> Simulation Summary
              </h3>

              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  This report is generated from the call transcript and interview session signals collected during the mock interview.
                </p>
                <p>
                  Use the identified strengths and weaknesses to guide your next mock session.
                </p>

                  <div className="mt-6 pt-6 border-t border-border/40">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-3">Critical Weaknesses</h4>
                    <ul className="space-y-3">
                      {(evaluation?.improvements || []).map((imp: string, idx: number) => (
                         <li key={idx} className="flex items-start gap-2">
                           <span className="text-primary mt-1">•</span>
                           <span className="font-medium text-foreground/80">{imp}</span>
                         </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {Boolean(interview?.audioUrl) && (
                  <div className="pt-6 border-t border-border/40">
                    <Button variant="outline" className="w-full h-14 rounded-2xl gap-3 border-2 border-primary/20 hover:bg-primary/5">
                      <Play size={18} className="text-primary" fill="currentColor" /> Play Audio Recording
                    </Button>
                  </div>
                )}
             </CardBody>
           </Card>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-12 border-t border-border">
         <Button onClick={onRestart} size="xl" variant="outline" className="w-full sm:w-auto px-10 h-16 rounded-2xl border-2 gap-3 hover:bg-muted font-black uppercase tracking-widest">
           <RotateCcw size={18} /> New Session
         </Button>
         <Button onClick={() => window.location.href = '/dashboard'} size="xl" className="w-full sm:w-auto px-10 h-16 rounded-2xl primary-gradient gap-3 shadow-xl hover:scale-105 transition-transform font-black uppercase tracking-widest">
           <ListRestart size={18} /> Back to Dashboard
         </Button>
         <Button variant="ghost" className="size-16 rounded-2xl border-2 border-border/50 hover:bg-muted">
           <Share2 size={24} className="text-muted-foreground" />
         </Button>
      </div>
    </div>
  );
}
