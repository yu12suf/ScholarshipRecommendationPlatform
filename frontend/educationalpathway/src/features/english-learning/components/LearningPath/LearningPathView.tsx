"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle,
  BookOpen,
  Headphones,
  PenLine,
  Mic,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Circle,
  Loader2,
  ArrowRight,
  TrendingUp,
  Clock,
  Youtube,
  User,
  MessageCircle,
  Trophy,
  History,
  Lock,
  ArrowUpCircle,
  BarChart3,
  BookMarked,
  Info,
  ChevronRight,
  Map as MapIcon,
  StopCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { 
  getLearningPath, 
  completeSection, 
  evaluateSpeakingPractice 
} from "@/features/assessments/api/assessment-api";
import Link from "next/link";

interface Video {
  id: number;
  videolink: string;
  thubnail: string;
  title?: string;
  isCompleted?: boolean;
}

interface SkillData {
  videos: Video[];
  notes: string;
  isNoteCompleted?: boolean;
}

interface LearningPathData {
  proficiencyLevel: 'easy' | 'medium' | 'hard';
  skills: Record<string, SkillData>;
  learningMode?: Record<string, any[]>;
  competencyGapAnalysis?: any;
  curriculumMap?: any;
  current_progress_percentage?: number;
   examType?: string;
   exam_type?: string;
}

const levelConfig: Record<string, { label: string; color: string; border: string; bg: string }> = {
  easy: { label: "Beginner", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  medium: { label: "Intermediate", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  hard: { label: "Advanced", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
};

const skillIcons: Record<string, any> = {
  reading: BookOpen,
  listening: Headphones,
  writing: PenLine,
  speaking: Mic,
};

const speakingExamScale: Record<string, { max: number; label: string }> = {
   IELTS: { max: 9, label: "Band" },
   TOEFL: { max: 30, label: "Score" },
   DUOLINGO: { max: 160, label: "Score" },
   PTE: { max: 90, label: "Score" },
   CELPIP: { max: 12, label: "Level" },
};

const normalizeExamType = (raw: unknown) => {
   if (!raw) return "IELTS";
   const cleaned = String(raw).trim().toUpperCase();
   return speakingExamScale[cleaned] ? cleaned : "IELTS";
};

const parseNumericValue = (value: unknown): number | null => {
   if (typeof value === "number" && Number.isFinite(value)) return value;
   if (typeof value === "string") {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : null;
   }
   return null;
};

const normalizeChoiceText = (value: unknown) =>
   String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/^[a-d]\s*[\.)\-:]\s*/i, "")
      .replace(/\s+/g, " ");

const isCorrectOption = (answer: unknown, option: string, options: string[]) => {
   const normalizedOption = normalizeChoiceText(option);
   const normalizedAnswer = normalizeChoiceText(answer);

   if (!normalizedAnswer) return false;
   if (normalizedAnswer === normalizedOption) return true;

   const letterMap = ["a", "b", "c", "d"];

   if (letterMap.includes(normalizedAnswer)) {
      const expectedOption = options[letterMap.indexOf(normalizedAnswer)];
      return normalizeChoiceText(expectedOption) === normalizedOption;
   }

   if (/^\d+$/.test(normalizedAnswer)) {
      const numericAnswer = parseInt(normalizedAnswer, 10);
      const idx = numericAnswer > 0 ? numericAnswer - 1 : numericAnswer;
      if (idx >= 0 && idx < options.length) {
         return normalizeChoiceText(options[idx]) === normalizedOption;
      }
   }

   const optionPrefixMatch = String(option).trim().match(/^([a-d])\s*[\.)\-:]/i);
   if (optionPrefixMatch && optionPrefixMatch[1].toLowerCase() === normalizedAnswer) {
      return true;
   }

   return false;
};

const getSkillQuestions = (learningMode: LearningPathData["learningMode"], skill: string) => {
   const modeData = learningMode?.[skill];
   return Array.isArray(modeData) ? modeData : (modeData as any)?.questions || [];
};

const isSkillLocallyComplete = (pathData: LearningPathData, skill: string) => {
   const skillData = pathData.skills?.[skill];
   if (!skillData) return false;

   const videos = skillData.videos || [];
   const videosComplete = videos.length === 0 || videos.every((v) => !!v.isCompleted);
   const noteComplete = !!skillData.isNoteCompleted;

   const questions = getSkillQuestions(pathData.learningMode, skill);
   const questionsComplete = questions.length === 0 || questions.every((q: any) => !!q.isCompleted);

   return videosComplete && noteComplete && questionsComplete;
};

const getSkillCompletionStatus = (pathData: LearningPathData, skill: string) => {
   const skillData = pathData.skills?.[skill];
   if (!skillData) {
      return {
         skill,
         complete: false,
         videosComplete: false,
         noteComplete: false,
         questionsComplete: false,
         videosDone: 0,
         videosTotal: 0,
         questionsDone: 0,
         questionsTotal: 0,
      };
   }

   const videos = skillData.videos || [];
   const videosDone = videos.filter((v) => !!v.isCompleted).length;
   const videosTotal = videos.length;
   const videosComplete = videosTotal === 0 || videosDone === videosTotal;

   const questions = getSkillQuestions(pathData.learningMode, skill);
   const questionsDone = questions.filter((q: any) => !!q.isCompleted).length;
   const questionsTotal = questions.length;
   const questionsComplete = questionsTotal === 0 || questionsDone === questionsTotal;

   const noteComplete = !!skillData.isNoteCompleted;
   const complete = videosComplete && noteComplete && questionsComplete;

   return {
      skill,
      complete,
      videosComplete,
      noteComplete,
      questionsComplete,
      videosDone,
      videosTotal,
      questionsDone,
      questionsTotal,
   };
};

const getSpeakingScoreMeta = (result: any, fallbackExamType: string) => {
   const examType = normalizeExamType(
      result?.examType || result?.exam_type || fallbackExamType,
   );
   const scale = speakingExamScale[examType] || speakingExamScale.IELTS;

   const possibleScoreKeys = [
      result?.score,
      result?.overall_band,
      result?.speaking_band,
      result?.speaking_score,
      result?.band,
      result?.predicted_band,
   ];

   const score = possibleScoreKeys
      .map(parseNumericValue)
      .find((num): num is number => num !== null) ?? null;

   return {
      examType,
      score,
      max: scale.max,
      label: scale.label,
      percent: score === null ? 0 : Math.min(100, (score / scale.max) * 100),
      displayScore: score === null ? "N/A" : Number(score.toFixed(1)).toString(),
   };
};

export function LearningPathView() {
  const [data, setData] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("reading");
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
   const [syncingAll, setSyncingAll] = useState(false);
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});
   const [syncHint, setSyncHint] = useState<string | null>(null);

  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, Record<number, string>>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, Record<number, boolean>>>({});
  
  // Audio Recording for Speaking Practice
  const [isRecording, setIsRecording] = useState<Record<number, boolean>>({});
  const [recordingSeconds, setRecordingSeconds] = useState<Record<number, number>>({});
  const [evaluationResults, setEvaluationResults] = useState<Record<number, any>>({});
  const [evaluating, setEvaluating] = useState<Record<number, boolean>>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingIntervals = useRef<Record<number, NodeJS.Timeout>>({});

  const load = async () => {
    try {
      setLoading(true);
      const res = await getLearningPath();
      const pathData = res?.skills ? res : (res?.data?.skills ? res.data : null);
      if (pathData) {
        setData(pathData);
        const skills = Object.keys(pathData.skills);
        if (skills.length > 0 && !skills.includes(activeTab)) setActiveTab(skills[0]);
      } else {
        setError("Not found");
      }
    } catch (err: any) {
      setError(err.response?.status === 404 ? "Not found" : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Local-only visual toggle for videos
  const handleToggleVideo = (videoId: number) => {
    if (!data) return;
    const newData = { ...data };
    const video = newData.skills[activeTab].videos.find(v => v.id === videoId);
    if (video) {
      video.isCompleted = !video.isCompleted;
      setData({ ...newData });
    }
  };

  // Local-only visual toggle for note
  const handleToggleNote = () => {
    if (!data) return;
    const newData = { ...data };
    newData.skills[activeTab].isNoteCompleted = !newData.skills[activeTab].isNoteCompleted;
    setData({ ...newData });
  };

  // Local-only toggle for practice questions
  const handleSelectAnswer = (skill: string, qIndex: number, answer: string) => {
    setPracticeAnswers(prev => ({ ...prev, [skill]: { ...(prev[skill] || {}), [qIndex]: answer } }));
    setShowExplanation(prev => ({ ...prev, [skill]: { ...(prev[skill] || {}), [qIndex]: true } }));
    
    // Safety check for complex learningMode structures (like listening)
    const modeData = data?.learningMode?.[skill];
    const questions = Array.isArray(modeData) ? modeData : (modeData as any)?.questions || [];
    
    if (questions[qIndex]) {
      questions[qIndex].isCompleted = true;
      setData({ ...data! });
    }
  };

  // Speaking Practice Logic
  const startRecording = async (qIndex: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
         const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
         handleEvaluateSpeaking(qIndex, blob);
         stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(prev => ({ ...prev, [qIndex]: true }));
      setRecordingSeconds(prev => ({ ...prev, [qIndex]: 0 }));
      recordingIntervals.current[qIndex] = setInterval(() => {
        setRecordingSeconds(prev => ({ ...prev, [qIndex]: (prev[qIndex] || 0) + 1 }));
      }, 1000);
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = (qIndex: number) => {
    if (mediaRecorderRef.current && isRecording[qIndex]) {
      mediaRecorderRef.current.stop();
      setIsRecording(prev => ({ ...prev, [qIndex]: false }));
      if (recordingIntervals.current[qIndex]) clearInterval(recordingIntervals.current[qIndex]);
    }
  };

  const handleEvaluateSpeaking = async (qIndex: number, blob: Blob) => {
    try {
      setEvaluating(prev => ({ ...prev, [qIndex]: true }));
      const result = await evaluateSpeakingPractice(qIndex, blob);
         // Support both wrapped ({ success, data }) and direct payload responses.
         const normalizedResult = (result && typeof result === 'object' && 'data' in result)
            ? (result as { data?: any }).data
            : result;

         if (normalizedResult) {
            setEvaluationResults(prev => ({ ...prev, [qIndex]: normalizedResult }));
        setShowExplanation(prev => ({ ...prev, [activeTab]: { ...(prev[activeTab] || {}), [qIndex]: true } }));
        
        // Mark as completed locally
        const modeData = data?.learningMode?.[activeTab];
        const questions = Array.isArray(modeData) ? modeData : (modeData as any)?.questions || [];
        if (questions[qIndex]) {
          questions[qIndex].isCompleted = true;
          setData({ ...data! });
        }
      }
    } catch (err) {
      console.error("Evaluation failed", err);
    } finally {
      setEvaluating(prev => ({ ...prev, [qIndex]: false }));
    }
  };

  // THE KEY ACTION: Save an entire section to the backend at once
  const handleCompleteSection = async (section: string) => {
    try {
      setCompleting(true);
         setSyncHint(null);
      await completeSection(section);
      setCompletedSections(prev => ({ ...prev, [section]: true }));
      // Reload to get the updated global progress percentage
      await load();
    } catch (err) {
      console.error("Failed to complete section", err);
         setSyncHint("Could not sync section right now. Please try again.");
    } finally {
      setCompleting(false);
    }
  };

   const handleSyncAllCompletedSections = async () => {
      if (!data) return;
      try {
         setSyncingAll(true);
         setSyncHint(null);

         const skillNames = Object.keys(data.skills);
         const completedSkills = skillNames.filter((skill) => isSkillLocallyComplete(data, skill));

         for (const skill of completedSkills) {
            await completeSection(skill);
         }

         const completedFlags = completedSkills.reduce(
            (acc, skill) => ({ ...acc, [skill]: true }),
            {} as Record<string, boolean>,
         );
         setCompletedSections((prev) => ({ ...prev, ...completedFlags }));
         await load();
      } catch (err) {
         console.error("Failed to sync all completed sections", err);
         setSyncHint("Could not sync all sections. Please try again.");
      } finally {
         setSyncingAll(false);
      }
   };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        <p className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Constructing Curriculum Matrix...</p>
      </div>
    );
  }

  if (error === "Not found") {
    return (
      <div className="max-w-xl mx-auto py-32 text-center space-y-10">
         <div className="mx-auto w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-primary/60" />
         </div>
         <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Active Matrix Required</h2>
            <p className="text-muted-foreground font-normal text-base leading-relaxed">
               Please complete your diagnostic assessment to initialize your specialized curriculum roadmap.
            </p>
         </div>
         <Link href="/dashboard/assessment">
            <Button size="lg" className="primary-gradient px-12 h-12 rounded-xl shadow-none font-medium">
               Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
         </Link>
      </div>
    );
  }

  if (!data || !data.skills) return null;

  const currentSkill = data.skills[activeTab];
  const progress = data.current_progress_percentage || 0;
   const skillNames = Object.keys(data.skills);
   const skillStatusList = skillNames.map((skill) => getSkillCompletionStatus(data, skill));
   const locallyCompletedSkillCount = skillStatusList.filter((s) => s.complete).length;
   const localUnitsTotal = skillNames.length;
   const localUnitsCompleted = locallyCompletedSkillCount;
   const localProgress = localUnitsTotal > 0 ? Math.round((localUnitsCompleted / localUnitsTotal) * 100) : 0;
   const isOutOfSync = localProgress > progress;
   const incompleteSkillStatus = skillStatusList.filter((s) => !s.complete);
  const canLevelUp = progress >= 100;
   const currentExamType = normalizeExamType(
      data.examType || data.exam_type || data.competencyGapAnalysis?.exam_type || data.competencyGapAnalysis?.examType,
   );

  // Normalize learning mode questions (handle both array and object-with-questions formats)
  const modeData = data.learningMode?.[activeTab];
  const pQues = Array.isArray(modeData) ? modeData : (modeData as any)?.questions || [];
  const listeningScript = (modeData as any)?.script || null;
  const listeningAudio = (modeData as any)?.audio_base64 || null;

  const pTotal = pQues.length;
  const pComp = pQues.filter((q: any) => q.isCompleted).length;

  const vTotal = currentSkill?.videos?.length || 0;
  const vComp = currentSkill?.videos?.filter(v => v.isCompleted).length || 0;

  const isSectionSaved = completedSections[activeTab] || false;

  return (
    <div className="space-y-16 pb-32 max-w-7xl mx-auto px-4 md:px-8">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-end justify-between border-b border-border/60 pb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <span className={`px-4 py-1 rounded-full border text-[10px] font-medium uppercase tracking-widest ${levelConfig[data.proficiencyLevel].color} ${levelConfig[data.proficiencyLevel].bg} ${levelConfig[data.proficiencyLevel].border}`}>
               Level: {levelConfig[data.proficiencyLevel].label}
             </span>
             <span className="flex items-center gap-1.5 text-muted-foreground font-medium text-[10px] uppercase tracking-widest opacity-40">
               <History size={12} /> Sync Status: Active
             </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight leading-none uppercase">Curriculum Feed</h1>
            <p className="text-muted-foreground font-normal text-base">Results-driven study roadmap for specialized domains.</p>
          </div>
        </div>

        <div className="flex items-center gap-10">
           <div className="text-right space-y-1">
              <p className="text-[10px] font-medium uppercase text-muted-foreground tracking-[0.2em] opacity-40">Total Mastery</p>
              <p className="text-4xl font-semibold text-primary leading-none">{progress}%</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-emerald-600/80">Local Completion: {localProgress}%</p>
           </div>
           <div className="relative h-16 w-16 flex items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                 <circle className="text-muted/10 stroke-current" strokeWidth="4" cx="50" cy="50" r="46" fill="transparent" />
                 <circle className="text-primary stroke-current transition-all duration-1000 ease-out"
                         strokeWidth="4" strokeDasharray={`${progress * 2.89} 289`}
                         strokeLinecap="round" cx="50" cy="50" r="46" fill="transparent" />
              </svg>
              <Trophy size={20} className="text-primary" />
           </div>
        </div>
      </div>

         {(isOutOfSync || syncHint || incompleteSkillStatus.length > 0) && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
               <div className="space-y-2">
                  <p className="text-sm text-amber-900">
                     {syncHint || `You completed ${localProgress}% locally, but synced progress is ${progress}%. Click Sync All Completed to push every finished section.`}
                  </p>
                  {incompleteSkillStatus.length > 0 && (
                     <div className="text-xs text-amber-900/90 space-y-1">
                        {incompleteSkillStatus.map((s) => (
                           <p key={s.skill}>
                              {s.skill.toUpperCase()}: videos {s.videosDone}/{s.videosTotal}, questions {s.questionsDone}/{s.questionsTotal}, note {s.noteComplete ? "done" : "pending"}
                           </p>
                        ))}
                     </div>
                  )}
               </div>
               <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleSyncAllCompletedSections} disabled={syncingAll || completing}>
                     {syncingAll ? "Syncing..." : "Sync All Completed"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleCompleteSection(activeTab)} disabled={completing}>
                     Sync {activeTab}
                  </Button>
               </div>
            </div>
         )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
        {/* SIDEBAR */}
        <div className="lg:col-span-1 space-y-12">
           <div className="space-y-4">
              <h4 className="text-[10px] font-medium uppercase tracking-[0.2em] px-2 text-muted-foreground opacity-40">Skill Selection</h4>
              <div className="space-y-1">
                 {Object.keys(data.skills).map((skill) => {
                    const Icon = skillIcons[skill];
                    const active = activeTab === skill;
                    const saved = completedSections[skill];
                    return (
                       <button
                         key={skill}
                         onClick={() => setActiveTab(skill)}
                         className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 font-medium uppercase text-[11px] tracking-widest ${active ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted/40"}`}
                       >
                          <div className="flex items-center gap-4">
                             <Icon size={14} className={active ? "text-white" : "text-primary/70"} />
                             <span>{skill}</span>
                          </div>
                          {saved
                            ? <CheckCircle2 size={12} className={active ? "text-white" : "text-primary"} />
                            : <ChevronRight size={12} className={active ? "opacity-100" : "opacity-0"} />
                          }
                       </button>
                    );
                 })}
              </div>
           </div>

           <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-6 grayscale opacity-80">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary/60">
                 <BarChart3 size={18} />
              </div>
              <div className="space-y-2">
                 <h5 className="text-[10px] font-medium uppercase tracking-widest leading-none">Promotion Target</h5>
                 <p className="text-[11px] font-normal text-muted-foreground leading-relaxed">Complete all 4 skill sections to reach 100% and unlock tier-elevation.</p>
              </div>
           </div>

           {/* CURRICULUM MAP PANEL */}
           {data.curriculumMap && (
              <div className="p-8 rounded-3xl bg-linear-to-br from-primary/5 to-accent/5 border border-primary/10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
                       <MapIcon size={16} />
                    </div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest">Growth Sprints</h5>
                 </div>
                 <div className="space-y-3">
                    {data.curriculumMap.sprints?.map((sprint: any, i: number) => (
                       <div key={i} className="flex gap-3">
                          <div className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold ${sprint.is_remedial ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>W{sprint.week}</div>
                          <p className="text-[10px] text-muted-foreground leading-tight pt-1">{sprint.goal}</p>
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>

        {/* MAIN FEED */}
        <div className="lg:col-span-3 space-y-24">
           <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-24">

                 {/* 01 COMPETENCY STRATEGY */}
                 <section className="space-y-10">
                    <div className="flex items-center gap-2 px-2">
                       <span className="h-1 w-4 bg-primary/40 rounded-full" />
                       <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary/70">01 / Competency Strategy</h2>
                    </div>

                    <div className="space-y-12">
                       <div className="space-y-6">
                          <h3 className="text-2xl font-semibold tracking-tight">Gap Analysis Summary</h3>
                          <div className="max-w-4xl text-lg font-normal leading-relaxed text-foreground/80 italic">
                             "{data.competencyGapAnalysis?.proficiency_profile || "Analyzing student response profile..."}"
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                             {data.competencyGapAnalysis?.weaknesses?.map((w: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-red-500/5 text-red-600 rounded-full text-[10px] font-medium uppercase border border-red-200/10 tracking-widest">{w}</span>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-4 pt-10 border-t border-border/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-primary/50">
                               <BookMarked size={14} /> Subject Directive
                            </div>
                            <button
                              onClick={handleToggleNote}
                              className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-medium uppercase tracking-widest transition-all ${currentSkill?.isNoteCompleted ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted'}`}
                            >
                              {currentSkill?.isNoteCompleted ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                              {currentSkill?.isNoteCompleted ? 'Directive Acknowledged' : 'Mark as Read'}
                            </button>
                          </div>
                          <div className="text-sm font-normal text-muted-foreground/90 leading-relaxed max-w-4xl whitespace-pre-wrap">
                             {data.competencyGapAnalysis?.section_analysis?.[activeTab] || currentSkill?.notes}
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* 02 CURRICULUM MODULES */}
                 <section className="space-y-10">
                    <div className="flex items-center gap-2 px-2">
                       <span className="h-1 w-4 bg-primary/40 rounded-full" />
                       <h2 className="text-[10px] font-medium uppercase tracking-[0.3em] text-primary/70">02 / Curriculum Modules</h2>
                    </div>

                    <div className="space-y-24">
                       {/* Video Modules */}
                       <div className="space-y-8">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                             <h4 className="font-medium text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-40">Instructional Log Feed</h4>
                             <span className="text-[9px] font-medium uppercase tracking-widest text-primary/60">{vComp} / {vTotal} COMPLETED</span>
                          </div>

                          <div className="divide-y divide-border/60">
                             {currentSkill?.videos?.map((v, i) => (
                               <div key={v.id} className="flex items-center py-6 gap-8 group">
                                  <button onClick={() => handleToggleVideo(v.id)} className={`${v.isCompleted ? 'text-primary' : 'text-muted-foreground/10 hover:text-primary transition-colors'}`}>
                                     {v.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                  </button>
                                  <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-center gap-8">
                                     <div className="h-14 w-14 bg-slate-50 rounded-full shrink-0 flex items-center justify-center text-slate-300 overflow-hidden relative border border-border/40 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all">
                                        <img src={v.thubnail} className="h-full w-full object-cover" />
                                        {v.videolink && (
                                          <a href={v.videolink} target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 text-white transition-all opacity-0 hover:opacity-100"><PlayCircle size={18} /></a>
                                        )}
                                     </div>
                                     <div className="flex-1 space-y-1">
                                        <p className={`text-lg font-medium tracking-tight ${v.isCompleted ? 'text-muted-foreground line-through opacity-40' : 'text-foreground/90'}`}>{v.title || `Instructional Module 0${i + 1}`}</p>
                                        <div className="flex items-center gap-3 text-[9px] font-medium uppercase tracking-widest text-muted-foreground opacity-30">
                                           <span>TIER {data.proficiencyLevel.toUpperCase()}</span>
                                           <span className="h-1 w-1 bg-border rounded-full" />
                                           <span>LOG MODULE</span>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>

                       {/* Practice Matrix */}
                       <div className="space-y-8">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                             <h4 className="font-medium text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-40">Practical Application Matrix</h4>
                             <span className="text-[9px] font-medium uppercase tracking-widest text-primary/60">{pComp} / {pTotal} RESOLVED</span>
                          </div>

                          <div className="divide-y divide-border/60">
                             {pQues.length > 0 ? pQues.map((q: any, idx: number) => (
                               <div key={idx} className="py-12 space-y-8">
                                  <div className="space-y-4">
                                     <div className="flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full border border-primary/20 flex items-center justify-center text-[9px] font-medium text-primary opacity-60">0{idx + 1}</div>
                                        <h5 className="text-xl font-medium tracking-tight leading-tight italic text-foreground/80">"{String(q.question || q.prompt)}"</h5>
                                     </div>

                                     {/* LISTENING SCRIPT (New feature) */}
                                     {activeTab === 'listening' && listeningScript && (
                                       <div className="space-y-4">
                                         <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
                                           <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 opacity-40">Audio Transcript</p>
                                           <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{listeningScript}</p>
                                         </div>
                                       </div>
                                     )}

                                     {/* AUDIO PLAYER FOR LISTENING SECTION (Enhanced) */}
                                     {(q.audio_base64 || listeningAudio) && (
                                       <div className="p-5 bg-linear-to-r from-primary/5 to-accent/5 border border-primary/10 rounded-2xl space-y-3 max-w-2xl">
                                          <div className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-widest text-primary/60">
                                             <Headphones size={12} /> Listening Stimulus
                                          </div>
                                          <audio controls className="w-full h-10" src={`data:audio/mp3;base64,${q.audio_base64 || listeningAudio}`}>
                                             Your browser does not support the audio element.
                                          </audio>
                                       </div>
                                     )}

                                     {q.options ? (
                                       <div className="grid md:grid-cols-2 gap-3 max-w-3xl pt-2">
                                          {q.options.map((opt: string) => {
                                            const rev = showExplanation[activeTab]?.[idx];
                                               const correct = isCorrectOption(q.answer, opt, q.options);
                                            const selected = practiceAnswers[activeTab]?.[idx] === opt;
                                            return (
                                               <button key={opt} disabled={rev} onClick={() => handleSelectAnswer(activeTab, idx, opt)}
                                                                                  className={`text-left p-4 rounded-xl text-sm font-medium transition-all border tracking-tight flex items-center justify-between gap-3 ${rev ? correct ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : selected ? 'bg-red-50 border-red-300 text-red-700' : 'bg-muted border-transparent opacity-50' : 'bg-muted/20 border-transparent hover:border-primary/40'}`}>
                                                                           <span>{opt}</span>
                                                                           {rev && correct && <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />}
                                                                           {rev && selected && !correct && <AlertCircle size={16} className="shrink-0 text-red-600" />}
                                               </button>
                                            );
                                          })}
                                       </div>
                                     ) : activeTab === 'speaking' ? (
                                       <div className="space-y-6 max-w-2xl">
                                          {evaluationResults[idx] ? (
                                                                  (() => {
                                                                     const scoreMeta = getSpeakingScoreMeta(evaluationResults[idx], currentExamType);
                                                                     return (
                                                                        <div className="space-y-4">
                                                                           <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                                                                              <div className="flex items-center justify-between gap-3">
                                                                                 <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-700">Speaking {scoreMeta.label}</p>
                                                                                 <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700/80">{scoreMeta.examType}</span>
                                                                              </div>
                                                                              <p className="text-2xl font-semibold text-emerald-700 leading-none">
                                                                                 {scoreMeta.displayScore}
                                                                                 <span className="text-sm font-medium text-emerald-700/70"> / {scoreMeta.max}</span>
                                                                              </p>
                                                                              <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                                                                                 <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${scoreMeta.percent}%` }} />
                                                                              </div>
                                                                              {scoreMeta.score === null && (
                                                                                 <p className="text-[10px] text-emerald-800/80">Numeric score is unavailable in this response. Feedback is shown below.</p>
                                                                              )}
                                                                           </div>

                                                                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                               {[
                                                                                  { label: 'Pronunciation', val: evaluationResults[idx].pronunciation },
                                                                                  { label: 'Fluency', val: evaluationResults[idx].fluency },
                                                                                  { label: 'Coherence', val: evaluationResults[idx].coherence },
                                                                               ].map((stat, i) => (
                                                                                  <div key={i} className="p-3 rounded-xl bg-card border border-border space-y-1">
                                                                                       <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                                                                       <p className="text-[10px] leading-tight text-foreground/80 line-clamp-3">{stat.val || "No detailed feedback"}</p>
                                                                                  </div>
                                                                               ))}
                                                                           </div>
                                                                        </div>
                                                                     );
                                                                  })()
                                          ) : (
                                             <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-muted/20 border border-dashed border-border/60">
                                               {isRecording[idx] ? (
                                                 <>
                                                   <div className="flex items-center gap-4">
                                                      <div className="size-3 bg-destructive rounded-full animate-pulse" />
                                                      <span className="text-xl font-mono font-bold text-destructive">{Math.floor((recordingSeconds[idx] || 0) / 60)}:{(recordingSeconds[idx] || 0) % 60 < 10 ? '0' : ''}{(recordingSeconds[idx] || 0) % 60}</span>
                                                   </div>
                                                   <Button onClick={() => stopRecording(idx)} className="rounded-full bg-destructive hover:bg-destructive/90 text-white gap-2">
                                                      <StopCircle size={16} /> Stop & Evaluate
                                                   </Button>
                                                 </>
                                               ) : (
                                                 <>
                                                   <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                      <Mic size={24} />
                                                   </div>
                                                   <div className="text-center space-y-1">
                                                      <p className="text-sm font-bold">Ready to Practice?</p>
                                                      <p className="text-xs text-muted-foreground">Record your response for immediate AI scoring.</p>
                                                   </div>
                                                   <Button disabled={evaluating[idx]} onClick={() => startRecording(idx)} className="rounded-full primary-gradient text-white gap-2">
                                                      {evaluating[idx] ? <><Loader2 size={16} className="animate-spin" /> Evaluating...</> : <><Mic size={16} /> Start Recording</>}
                                                   </Button>
                                                 </>
                                               )}
                                             </div>
                                          )}
                                       </div>
                                     ) : (
                                       <div className="p-8 bg-slate-50/50 border border-border/60 rounded-2xl">
                                          <textarea className="w-full bg-transparent text-lg font-normal placeholder:text-muted-foreground/20 focus:outline-none min-h-[120px] tracking-tight"
                                                    placeholder="Input formalized response transcript..." onBlur={(e) => handleSelectAnswer(activeTab, idx, e.target.value)} />
                                       </div>
                                     )}

                                     {showExplanation[activeTab]?.[idx] && (
                                       <div className="p-6 bg-indigo-50/40 border-l border-indigo-400 rounded-r-2xl animate-in fade-in duration-700">
                                          <div className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-widest text-indigo-500 mb-3 opacity-60">
                                             <Sparkles size={12} /> Evaluative Appraisal
                                          </div>
                                          <div className="text-base font-normal text-indigo-900 leading-relaxed italic max-w-4xl opacity-90">
                                             "{String(q.explanation || q.tips || q.sample_answer || q.sample_response)}"
                                          </div>
                                       </div>
                                     )}
                                  </div>
                               </div>
                             )) : (
                               <div className="py-20 flex flex-col items-center justify-center text-center opacity-10">
                                  <Lock size={32} className="mb-4" />
                                  <p className="text-[10px] font-medium uppercase tracking-widest">Protocol Sync Pending</p>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* FINALIZE SECTION BUTTON */}
                 <div className="flex flex-col items-center gap-4 pt-4 pb-12 border-b border-border/40">
                    {isSectionSaved ? (
                      <div className="flex items-center gap-3 px-8 py-4 bg-primary/5 border border-primary/20 rounded-2xl">
                         <CheckCircle2 size={20} className="text-primary" />
                         <span className="text-sm font-semibold text-primary uppercase tracking-widest">{activeTab} Section Saved</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleCompleteSection(activeTab)}
                        disabled={completing}
                        size="lg"
                        className="px-12 h-14 rounded-2xl primary-gradient text-white shadow-xl shadow-primary/20 font-semibold uppercase tracking-widest text-[11px] hover:scale-105 transition-transform disabled:opacity-60 disabled:scale-100"
                      >
                        {completing ? (
                          <><Loader2 size={16} className="mr-3 animate-spin" /> Saving {activeTab} Module...</>
                        ) : (
                          <>Complete {activeTab} Module & Save Progress <CheckCircle2 className="ml-3 h-4 w-4" /></>
                        )}
                      </Button>
                    )}
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">
                      Saves all videos, notes & practice for {activeTab}
                    </p>
                 </div>

                 {/* PROMOTION PROTOCOL */}
                 <div className="pt-12">
                    <div className="flex flex-col items-center text-center space-y-10 py-8">
                       <div className="relative">
                          <div className={`absolute -inset-8 rounded-full blur-3xl transition-all duration-1000 ${canLevelUp ? 'bg-primary/10' : 'bg-neutral-50'}`} />
                          <div className={`relative h-20 w-20 rounded-full border-2 flex items-center justify-center bg-white transition-all ${canLevelUp ? 'border-primary text-primary' : 'border-slate-100 text-slate-200'}`}>
                             {canLevelUp ? <ArrowUpCircle size={44} /> : <Lock size={32} />}
                          </div>
                       </div>

                       <div className="space-y-3 max-w-xl">
                          <h3 className="text-3xl font-semibold tracking-tighter uppercase leading-none">{canLevelUp ? "Tier Promotion Authorization" : "Mastery Protocol Active"}</h3>
                          <p className="text-muted-foreground font-normal text-base leading-relaxed opacity-80">
                             {canLevelUp
                               ? `Metric threshold verified. Authorization for ${data.proficiencyLevel.toUpperCase()} Tier Re-Assessment is currently active.`
                               : `Complete all 4 sections (Reading, Listening, Writing, Speaking) to reach 100% and unlock assessment.`}
                          </p>
                       </div>

                       <Link href={canLevelUp ? "/dashboard/assessment" : "#"}>
                          <Button disabled={!canLevelUp} size="lg" className={`px-16 h-14 rounded-full transition-all border-0 shadow-none font-medium ${canLevelUp ? 'primary-gradient text-white' : 'bg-muted text-muted-foreground opacity-50'}`}>
                             {canLevelUp ? "Initialize Re-Assessment" : "Progress Insufficient"} <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                       </Link>
                    </div>
                 </div>

              </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
