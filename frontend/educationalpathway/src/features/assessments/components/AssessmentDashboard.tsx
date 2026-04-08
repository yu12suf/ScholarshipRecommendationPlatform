"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Target,
  TrendingUp,
  Award,
  PlayCircle,
  Loader2,
  AlertCircle,
  Eye,
  BarChart2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import {
  generateAssessment,
  getAssessmentProgress,
} from "../api/assessment-api";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface ProgressItem {
  id: number;
  testId: string;
  examType: string;
  difficulty: string;
  overallBand: number | string;
  createdAt: string;
}

interface Props {
  onStartTest: (examData: any) => void;
  onViewResult: (item: ProgressItem) => void;
}

const difficultyColors: Record<string, string> = {
  Hard: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/10 text-warning",
  Easy: "bg-success/10 text-success",
};

export function AssessmentDashboard({ onStartTest, onViewResult }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [examType, setExamType] = useState<"IELTS" | "TOEFL">("IELTS");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    "Medium",
  );
  const [progressData, setProgressData] = useState<ProgressItem[]>([]);

  const [learningPathError, setLearningPathError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await getAssessmentProgress();
      const progressItems = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setProgressData(progressItems);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleStartExam = async () => {
    try {
      setLearningPathError(null);
      setLoading(true);
      toast.loading("Generating your personalized assessment...", {
        id: "generating",
      });
      const res = await generateAssessment({ examType, difficulty });
      toast.dismiss("generating");
      toast.success("Assessment ready!");
      onStartTest(res);
    } catch (error: any) {
      toast.dismiss("generating");
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.error || error?.response?.data?.message;
      if (status === 403) {
        // Learning path not 100% complete
        const progress = error?.response?.data?.currentProgress ?? null;
        const msg = progress !== null
          ? `Your learning path is only ${progress}% complete. You must reach 100% across all sections (Reading, Writing, Listening, Speaking) before generating a mock exam.`
          : "You must complete 100% of your learning path (Reading, Writing, Listening & Speaking) before generating a mock exam.";
        setLearningPathError(msg);
      } else {
        toast.error(serverMessage || "Failed to generate assessment. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getOverallAverages = () => {
    const filtered = progressData.filter((d) => d.examType === examType);
    if (filtered.length === 0)
      return { band: "0", tests: 0, best: "0" };
    const numericBands = filtered.map((d) =>
      parseFloat(String(d.overallBand)),
    );
    const sum = numericBands.reduce((a, b) => a + b, 0);
    const best = Math.max(...numericBands);
    return {
      band: (sum / filtered.length).toFixed(isTOEFL ? 0 : 1),
      tests: filtered.length,
      best: best.toFixed(isTOEFL ? 0 : 1),
    };
  };

  const isTOEFL = examType === "TOEFL";
  const maxScore = isTOEFL ? 120 : 9;
  const thresholdBand = isTOEFL ? 90 : 6.5;
  const averages = getOverallAverages();
  const bandPercent = Math.min(100, (parseFloat(averages.band) / maxScore) * 100);

  // Last 7 items for chart (filtered by type)
  const chartData = progressData.filter((d) => d.examType === examType).slice(-7);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="h2 flex items-center gap-3">
            <BookOpen className="text-primary size-8" />
            Learning Pathway
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Evaluate your English proficiency through AI-generated mock exams
            tailored to your target scholarship band.
          </p>
        </div>
        <Button
          onClick={fetchStats}
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
        >
          Refresh Stats
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border border-border overflow-hidden">
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-label text-muted-foreground">
                  Avg {isTOEFL ? "Score" : "Band Score"}
                </p>
                <h3 className="text-4xl font-black mt-2 text-primary">
                  {averages.band}
                </h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg text-primary">
                <Target size={22} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Best score:{" "}
              <span className="font-semibold text-foreground">
                {averages.best}
              </span>
            </p>
          </CardBody>
        </Card>

        <Card className="border border-border">
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-label text-muted-foreground">Tests Taken</p>
                <h3 className="text-4xl font-black mt-2">{averages.tests}</h3>
              </div>
              <div className="bg-info/10 p-3 rounded-lg text-info">
                <TrendingUp size={22} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Keep practicing to improve your score.
            </p>
          </CardBody>
        </Card>

        <Card className="border border-border bg-linear-to-br from-primary/5 to-accent/5">
          <CardBody className="p-6 flex flex-col justify-between h-full gap-4">
            <div>
              <p className="text-label font-semibold text-foreground flex items-center gap-2">
                <Award className="text-accent size-4" /> Scholarship Goal
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Target {isTOEFL ? "Score" : "Band"}:{" "}
                <span className="font-bold text-foreground">
                  {thresholdBand}{!isTOEFL && ".0"}+
                </span>
              </p>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Your average</span>
                <span className="font-bold">{averages.band} / {maxScore}{!isTOEFL && ".0"}</span>
              </div>
              <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${bandPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
              {parseFloat(averages.band) >= thresholdBand && (
                <p className="text-xs text-success font-semibold mt-1.5 flex items-center gap-1">
                  <Sparkles className="size-3" /> Threshold achieved!
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Generate New Exam */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-primary/20 bg-card">
            <CardBody className="p-6 flex flex-col gap-6">
              <div>
                <h3 className="h4 flex items-center gap-2">
                  <PlayCircle className="text-primary" /> Start New Exam
                </h3>
                <p className="text-small text-muted-foreground mt-1">
                  Configure your mock assessment below.
                </p>
              </div>

              <div className="space-y-5">
                {/* Exam Type Toggle */}
                <div className="space-y-2">
                  <label className="text-label">Exam Type</label>
                  <div className="flex gap-3">
                    {(["IELTS", "TOEFL"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setExamType(t)}
                        className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                          examType === t
                            ? "bg-primary text-primary-foreground border-primary  shadow-primary/20"
                            : "bg-transparent border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                  <label className="text-label">Difficulty Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Easy", "Medium", "Hard"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                          difficulty === d
                            ? d === "Easy"
                              ? "bg-success text-white border-success"
                              : d === "Medium"
                                ? "bg-warning text-white border-warning"
                                : "bg-destructive text-white border-destructive"
                            : "bg-transparent border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Learning Path Error Banner */}
              {learningPathError && (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-sm">
                  <XCircle className="text-destructive shrink-0 mt-0.5" size={18} />
                  <div className="flex-1 space-y-2">
                    <p className="font-semibold text-destructive">Mock Exam Generation Failed</p>
                    <p className="text-muted-foreground leading-relaxed">{learningPathError}</p>
                    <Link
                      href="/dashboard/learning-path"
                      className="inline-flex items-center gap-1.5 text-primary font-semibold text-xs hover:underline mt-1"
                    >
                      Go to Learning Path <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}

              <Button
                onClick={handleStartExam}
                disabled={loading}
                className="w-full primary-gradient py-6 text-base font-bold mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 size-4" /> Generating
                    Exam...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" /> Generate Assessment
                  </>
                )}
              </Button>
            </CardBody>
          </Card>

          {/* Band Score Chart */}
          {chartData.length > 1 && (
            <Card className="border border-border">
              <CardBody className="p-6">
                <h3 className="h4 mb-4 flex items-center gap-2">
                  <BarChart2 className="text-primary size-5" /> Score Trend
                </h3>
                <div className="flex items-end gap-2 h-24">
                  {chartData.map((item, i) => {
                    const h = Math.max(
                      8,
                      (parseFloat(String(item.overallBand)) / maxScore) * 96,
                    );
                    return (
                      <motion.div
                        key={item.id || i}
                        className="flex-1 flex flex-col items-center gap-1 group cursor-default"
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                      >
                        <span className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.overallBand}
                        </span>
                        <div
                          className="w-full bg-primary/20 rounded-t-sm relative overflow-hidden"
                          style={{ height: `${h}px` }}
                        >
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm"
                            initial={{ height: 0 }}
                            animate={{ height: "100%" }}
                            transition={{ delay: 0.05 * i, duration: 0.5 }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString("en", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right: History */}
        <div className="lg:col-span-3">
          <Card className="border border-border min-h-[400px]">
            <CardBody className="p-6">
              <h3 className="h4 mb-5">Assessment History</h3>

              {loadingStats ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="animate-spin text-primary size-8" />
                </div>
              ) : progressData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground gap-3">
                  <AlertCircle className="size-12 opacity-20" />
                  <p className="font-medium">No assessments yet</p>
                  <p className="text-sm">
                    Generate your first exam to start tracking your progress.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...progressData].reverse().map((item, index) => (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * index }}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0 overflow-hidden">
                        {/* Band Badge */}
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-black text-sm">
                            {parseFloat(String(item.overallBand)).toFixed(1)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm">
                              {item.examType}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[item.difficulty] || "bg-muted text-muted-foreground"}`}
                            >
                              {item.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => onViewResult(item)}
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <Eye className="size-4" />
                        <span className="hidden sm:inline">View</span>
                        <ChevronRight className="size-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
