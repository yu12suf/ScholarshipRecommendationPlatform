"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import {
  CheckCircle2,
  Mic,
  StopCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  BookOpen,
  Headphones,
  PenLine,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { submitAssessment, getAssessmentResult } from "../api/assessment-api";

interface Props {
  examData: any;
  onComplete: () => void;
}

type SectionKey = "reading" | "listening" | "writing" | "speaking";

const SECTION_ORDER: SectionKey[] = ["reading", "listening", "writing", "speaking"];

const SECTION_META: Record<SectionKey, { label: string; icon: React.ReactNode; timeMinutes: number }> = {
  reading: { label: "Reading", icon: <BookOpen className="size-4" />, timeMinutes: 20 },
  listening: { label: "Listening", icon: <Headphones className="size-4" />, timeMinutes: 15 },
  writing: { label: "Writing", icon: <PenLine className="size-4" />, timeMinutes: 40 },
  speaking: { label: "Speaking", icon: <Mic className="size-4" />, timeMinutes: 15 },
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AssessmentTest({ examData, onComplete }: Props) {
  const blueprint = examData.data || examData;
  const testId = blueprint.test_id;
  const sections = blueprint.sections || {};

  const [currentSection, setCurrentSection] = useState<SectionKey>("reading");
  const [responses, setResponses] = useState<any>({
    reading: {},
    listening: {},
    writing: "",
    speaking: "",
  });

  // Timer state (countdown per section)
  const [timeLeft, setTimeLeft] = useState(SECTION_META.reading.timeMinutes * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>(undefined);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Track completion per section
  const [completedSections, setCompletedSections] = useState<Set<SectionKey>>(new Set());

  // Reset timer when section changes
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const sectionTime = SECTION_META[currentSection].timeMinutes * 60;
    setTimeLeft(sectionTime);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          toast(`⏰ Time's up for ${SECTION_META[currentSection].label}!`, { icon: "⚠️" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentSection]);

  const isSectionComplete = (sec: SectionKey): boolean => {
    if (sec === "reading") {
      const qs = sections.reading?.questions || [];
      return qs.length > 0 && qs.every((q: any) => responses.reading[q.id]);
    }
    if (sec === "listening") {
      const qs = sections.listening?.questions || [];
      return qs.length > 0 && qs.every((q: any) => responses.listening[q.id]);
    }
    if (sec === "writing") return responses.writing.trim().length >= 50;
    if (sec === "speaking") return !!audioBlob || responses.speaking.trim().length > 10;
    return false;
  };

  const handleSectionChange = useCallback(
    (next: SectionKey) => {
      if (isSectionComplete(currentSection)) {
        setCompletedSections((prev) => new Set(prev).add(currentSection));
      }
      setCurrentSection(next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentSection, responses, audioBlob]
  );

  const handleOptionSelect = (section: "reading" | "listening", questionId: number, option: string) => {
    setResponses((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [questionId]: option,
      },
    }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
      toast.success("Recording started");
    } catch (err) {
      toast.error("Microphone access denied. You can type your response instead.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      toast.success("Recording saved");
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Mark current section as complete
      if (isSectionComplete(currentSection)) {
        setCompletedSections((prev) => new Set(prev).add(currentSection));
      }
      await submitAssessment(testId, responses, audioBlob);
      toast.success("Assessment submitted. Grading in progress...");
      pollResult();
    } catch (error: any) {
      toast.error("Failed to submit assessment.");
      setIsSubmitting(false);
    }
  };

  const pollResult = async () => {
    const interval = setInterval(async () => {
      try {
        const res = await getAssessmentResult(testId);
        if (res.status === "success") {
          clearInterval(interval);
          setResult(res.data);
          setIsSubmitting(false);
        } else if (res.status === "failed") {
          clearInterval(interval);
          toast.error("Evaluation failed.");
          setIsSubmitting(false);
        }
        // Otherwise keep polling (waiting/active)
      } catch (err) {
        // silent
      }
    }, 3000);
  };

  // ============ RESULT VIEW ============
  if (result) {
    const evaluation = result.evaluation || result;
    const subs = evaluation.subscores || {};

    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="text-center space-y-2 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center p-4 bg-success/10 rounded-full mb-4"
          >
            <CheckCircle2 className="size-12 text-success" />
          </motion.div>
          <h1 className="h2 text-foreground">Assessment Complete!</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Your AI evaluation is ready. Re-take exams anytime to track your progress towards your target scholarship band.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-border">
            <CardBody className="p-8 text-center bg-linear-to-br from-primary/5 to-accent/5">
              <p className="text-label text-muted-foreground">Overall Band Score</p>
              <h2 className="text-7xl font-black mt-4 text-primary">
                {evaluation.overall_band || "0.0"}
              </h2>
              <div className="w-full mt-4 bg-muted h-2.5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-primary to-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (parseFloat(evaluation.overall_band || 0) / 9) * 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </CardBody>
          </Card>

          <Card className="border border-border">
            <CardBody className="p-6">
              <p className="font-bold mb-5">Section Scores</p>
              <div className="space-y-5">
                {[
                  { name: "Reading", val: subs.reading },
                  { name: "Listening", val: subs.listening },
                  { name: "Writing", val: subs.writing },
                  { name: "Speaking", val: subs.speaking },
                ].map((s, i) => (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{s.name}</span>
                      <span className="font-bold">{s.val || "—"}</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (parseFloat(s.val || 0) / 9) * 100)}%` }}
                        transition={{ duration: 0.7, delay: 0.15 * i }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="border border-border">
          <CardBody className="p-6">
            <h3 className="h4 mb-4">AI Feedback Report</h3>
            <div className="prose prose-sm max-w-none text-foreground bg-muted/30 p-6 rounded-sm border border-border/50">
              <p className="whitespace-pre-wrap leading-relaxed text-sm">
                {evaluation.feedback_report || "No detailed feedback generated."}
              </p>
            </div>

            {evaluation.adaptive_learning_tags && evaluation.adaptive_learning_tags.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="size-4 text-warning" /> Areas to Improve
                </h4>
                <div className="flex flex-wrap gap-2">
                  {evaluation.adaptive_learning_tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-destructive/10 text-destructive text-sm rounded-full font-medium border border-destructive/15"
                    >
                      {tag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="text-center pt-4">
          <Button onClick={onComplete} variant="outline" className="px-8 font-bold border-border shadow-sm">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // ============ GRADING LOADER ============
  if (isSubmitting) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-primary size-14" />
        <div className="text-center">
          <h2 className="h3">AI Evaluator is grading your exam</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Analyzing phrasing, assessing grammar, and matching your responses against the marking rubric...
          </p>
        </div>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ============ EXAM UI ============
  const currentIdx = SECTION_ORDER.indexOf(currentSection);
  const timerPct = (timeLeft / (SECTION_META[currentSection].timeMinutes * 60)) * 100;
  const isTimeLow = timeLeft <= 120; // 2 minutes warning

  const answeredReading = Object.keys(responses.reading).length;
  const answeredListening = Object.keys(responses.listening).length;
  const totalReadingQ = sections.reading?.questions?.length || 0;
  const totalListeningQ = sections.listening?.questions?.length || 0;

  const sectionProgress: Record<SectionKey, { done: number; total: number }> = {
    reading: { done: answeredReading, total: totalReadingQ },
    listening: { done: answeredListening, total: totalListeningQ },
    writing: { done: responses.writing.trim().length >= 50 ? 1 : 0, total: 1 },
    speaking: { done: !!audioBlob || responses.speaking.trim().length > 10 ? 1 : 0, total: 1 },
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 pb-28">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
        <div>
          <h1 className="h3">Mock Exam in Progress</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {blueprint.exam_summary?.type} · {blueprint.exam_summary?.difficulty} · ID:{" "}
            {testId.split("-")[0].toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border font-mono text-sm font-bold transition-colors ${
              isTimeLow
                ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse"
                : "bg-muted text-foreground border-border"
            }`}
          >
            <Clock className="size-4" />
            {formatTime(timeLeft)}
          </div>
          <Button
            onClick={handleSubmit}
            variant="scholarship"
            className="font-bold px-6 shadow-md shadow-primary/20"
          >
            Submit Exam <CheckCircle2 className="ml-2 size-4" />
          </Button>
        </div>
      </div>

      {/* Timer Progress Bar */}
      <div className="w-full bg-muted h-1 rounded-full overflow-hidden mb-6">
        <motion.div
          className={`h-full ${isTimeLow ? "bg-destructive" : "bg-primary"} rounded-full`}
          animate={{ width: `${timerPct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-border hide-scrollbar">
        {SECTION_ORDER.map((sec) => {
          const meta = SECTION_META[sec];
          const prog = sectionProgress[sec];
          const isActive = currentSection === sec;
          const isDone = completedSections.has(sec) || (prog.done === prog.total && prog.total > 0);

          return (
            <button
              key={sec}
              onClick={() => handleSectionChange(sec)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold capitalize transition-all shrink-0 border ${
                isActive
                  ? "bg-primary text-white border-primary shadow-md"
                  : isDone
                  ? "bg-success/10 text-success border-success/30"
                  : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                meta.icon
              )}
              {meta.label}
              {sec === "reading" || sec === "listening" ? (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-sm ${
                    isActive ? "bg-white/20" : "bg-muted-foreground/10"
                  }`}
                >
                  {prog.done}/{prog.total}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* ---- READING ---- */}
          {currentSection === "reading" && (
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border border-border">
                <CardBody className="p-6 h-[560px] overflow-y-auto custom-scrollbar">
                  <h3 className="h4 mb-4">Reading Passage</h3>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">
                      {sections.reading?.passage || "No passage provided."}
                    </p>
                  </div>
                </CardBody>
              </Card>
              <div className="space-y-5 h-[560px] overflow-y-auto custom-scrollbar pr-2">
                {sections.reading?.questions?.map((q: any, i: number) => (
                  <Card key={q.id || i} className="border border-border shadow-sm">
                    <CardBody className="p-5">
                      <p className="font-semibold text-sm mb-4">
                        {i + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options?.map((opt: string, j: number) => (
                          <label
                            key={j}
                            className={`flex items-start p-3 rounded-sm border cursor-pointer transition-colors ${
                              responses.reading[q.id] === opt
                                ? "bg-primary/5 border-primary"
                                : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`reading-${q.id}`}
                              value={opt}
                              checked={responses.reading[q.id] === opt}
                              onChange={() => handleOptionSelect("reading", q.id, opt)}
                              className="mt-1 mr-3 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ---- LISTENING ---- */}
          {currentSection === "listening" && (
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border border-border">
                <CardBody className="p-6 h-[560px] overflow-y-auto custom-scrollbar">
                  <h3 className="h4 mb-4 flex items-center gap-2">
                    Listening Task{" "}
                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-sm">
                      Audio Only
                    </span>
                  </h3>
                  
                  {sections.listening?.audio_base64 ? (
                    <div className="mt-8 mb-6 p-8 bg-linear-to-br from-primary/5 to-accent/5 rounded-sm border border-border flex flex-col items-center justify-center space-y-6 text-center shadow-inner">
                      <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Headphones className="size-10 text-primary animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-bold text-lg text-foreground">Play Listening Audio</p>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Listen carefully to the recording and answer the questions on the right. You can play it as many times as needed.
                        </p>
                      </div>
                      <audio 
                        controls 
                        className="w-full max-w-md h-12"
                        src={`data:audio/mp3;base64,${sections.listening.audio_base64}`}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ) : (
                    <div className="mt-8 p-6 bg-destructive/5 rounded-sm border border-destructive/20 flex flex-col items-center gap-4 text-center">
                      <AlertCircle className="size-10 text-destructive" />
                      <div>
                        <p className="font-bold text-destructive">Audio Missing</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          We encountered an error loading the audio for this section. Please try generating a new exam.
                        </p>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
              <div className="space-y-5 h-[560px] overflow-y-auto custom-scrollbar pr-2">
                {sections.listening?.questions?.map((q: any, i: number) => (
                  <Card key={q.id || i} className="border border-border shadow-sm">
                    <CardBody className="p-5">
                      <p className="font-semibold text-sm mb-4">
                        {i + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options?.map((opt: string, j: number) => (
                          <label
                            key={j}
                            className={`flex items-start p-3 rounded-sm border cursor-pointer transition-colors ${
                              responses.listening[q.id] === opt
                                ? "bg-primary/5 border-primary"
                                : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`listening-${q.id}`}
                              value={opt}
                              checked={responses.listening[q.id] === opt}
                              onChange={() => handleOptionSelect("listening", q.id, opt)}
                              className="mt-1 mr-3 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ---- WRITING ---- */}
          {currentSection === "writing" && (
            <div className="space-y-6">
              <Card className="border border-border bg-linear-to-r from-muted/50 to-transparent">
                <CardBody className="p-6">
                  <h3 className="font-bold text-foreground mb-2">Writing Task</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                    {sections.writing?.prompt || "No prompt provided."}
                  </p>
                </CardBody>
              </Card>
              <div className="relative">
                <textarea
                  value={responses.writing}
                  onChange={(e) => setResponses({ ...responses, writing: e.target.value })}
                  placeholder="Type your essay here... Minimum 250 words recommended."
                  className="w-full h-80 p-5 rounded-sm border border-border bg-card text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground/50 shadow-inner text-sm"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground font-medium">
                <span
                  className={
                    responses.writing.trim().split(/\s+/).filter(Boolean).length >= 250
                      ? "text-success"
                      : ""
                  }
                >
                  Word Count:{" "}
                  <strong>
                    {responses.writing.trim()
                      ? responses.writing.trim().split(/\s+/).filter(Boolean).length
                      : 0}
                  </strong>
                  <span className="text-muted-foreground font-normal"> / 250 recommended</span>
                </span>
              </div>
            </div>
          )}

          {/* ---- SPEAKING ---- */}
          {currentSection === "speaking" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <Card className="border border-border shadow-sm">
                <CardBody className="p-8 text-center">
                  <h3 className="font-bold text-lg mb-4">Speaking Task</h3>
                  <div className="bg-muted p-6 rounded-sm border border-border text-left mb-8">
                    <p className="text-foreground whitespace-pre-wrap text-sm">
                      {sections.speaking?.prompt || "No prompt provided."}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-5 mt-4">
                    {isRecording ? (
                      <>
                        <motion.button
                          onClick={stopRecording}
                          className="size-24 rounded-full bg-destructive flex items-center justify-center text-white shadow-lg shadow-destructive/30 hover:scale-105 transition-all"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        >
                          <StopCircle className="size-9" />
                        </motion.button>
                        <div className="text-center">
                          <p className="font-bold text-destructive animate-pulse">
                            Recording... {formatTime(recordingSeconds)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Tap the button to stop
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={startRecording}
                          className="size-24 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:scale-105 transition-all"
                        >
                          <Mic className="size-9" />
                        </button>
                        <div className="text-center">
                          <p className="font-bold text-lg">Tap to Start Speaking</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Allow microphone access when prompted
                          </p>
                        </div>
                      </>
                    )}

                    {audioBlob && !isRecording && (
                      <div className="w-full max-w-sm bg-success/10 text-success p-3.5 rounded-sm border border-success/25 flex items-center justify-center gap-2">
                        <CheckCircle2 size={18} />
                        <span className="font-semibold text-sm">
                          Audio recorded ({formatTime(recordingSeconds)})
                        </span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* OR type */}
              <div className="relative flex py-4 items-center">
                <div className="grow border-t border-border" />
                <span className="shrink-0 mx-4 text-muted-foreground text-xs font-semibold">
                  OR TYPE YOUR RESPONSE
                </span>
                <div className="grow border-t border-border" />
              </div>

              <textarea
                value={responses.speaking}
                onChange={(e) => setResponses({ ...responses, speaking: e.target.value })}
                placeholder="If you cannot record audio, type what you would say here..."
                className="w-full h-32 p-4 rounded-sm border border-border bg-card text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground/50 shadow-inner text-sm"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Fixed Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:ml-[260px] p-4 bg-card/90 backdrop-blur-md border-t border-border z-10 flex justify-between items-center px-8 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        {/* Left: Previous */}
        <Button
          variant="outline"
          disabled={currentIdx === 0}
          onClick={() => handleSectionChange(SECTION_ORDER[currentIdx - 1])}
          className="font-semibold border-border shadow-sm px-6"
        >
          <ArrowLeft className="mr-2 size-4" /> Previous
        </Button>

        {/* Center: Progress dots */}
        <div className="flex gap-2 items-center">
          {SECTION_ORDER.map((sec, i) => {
            const isDone = completedSections.has(sec);
            const isActive = sec === currentSection;
            return (
              <button
                key={sec}
                onClick={() => handleSectionChange(sec)}
                className={`rounded-full transition-all ${
                  isActive
                    ? "w-6 h-2.5 bg-primary"
                    : isDone
                    ? "w-2.5 h-2.5 bg-success"
                    : "w-2.5 h-2.5 bg-muted-foreground/30"
                }`}
              />
            );
          })}
        </div>

        {/* Right: Next / Submit */}
        {currentIdx < SECTION_ORDER.length - 1 ? (
          <Button
            className="primary-gradient font-bold shadow-md shadow-primary/20 px-8 text-white"
            onClick={() => handleSectionChange(SECTION_ORDER[currentIdx + 1])}
          >
            Next Section <ArrowRight className="ml-2 size-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="scholarship"
            className="font-bold px-8 shadow-md shadow-secondary/20"
          >
            Submit Exam <CheckCircle2 className="ml-2 size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
