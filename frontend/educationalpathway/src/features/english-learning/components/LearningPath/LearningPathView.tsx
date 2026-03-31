"use client";

import { useState, useEffect } from "react";
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
  User
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getLearningPath, trackProgress } from "@/features/assessments/api/assessment-api";
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
}

interface LearningPathData {
  proficiencyLevel: 'easy' | 'medium' | 'hard';
  skills: Record<string, SkillData>;
  learningMode?: any;
  competencyGapAnalysis?: any;
  curriculumMap?: any;
}

const levelConfig: Record<string, { label: string; color: string; border: string }> = {
  easy: { label: "Beginner Proficiency", color: "bg-blue-500/10 text-blue-600", border: "border-blue-500/20" },
  medium: { label: "Intermediate Proficiency", color: "bg-emerald-500/10 text-emerald-600", border: "border-emerald-500/20" },
  hard: { label: "Advanced Proficiency", color: "bg-amber-500/10 text-amber-600", border: "border-amber-500/20" },
};

const skillIcons: Record<string, any> = {
  reading: BookOpen,
  listening: Headphones,
  writing: PenLine,
  speaking: Mic,
};

export function LearningPathView() {
  const [data, setData] = useState<LearningPathData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("reading");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getLearningPath();
      
      if (!res) {
        setError("Not found");
        return;
      }

      // Handle different possible response structures
      const pathData = res.skills ? res : (res.data?.skills ? res.data : null);
      
      if (pathData) {
        setData(pathData);
        // Set first available skill as active
        const availableSkills = Object.keys(pathData.skills);
        if (availableSkills.length > 0 && !availableSkills.includes(activeTab)) {
          setActiveTab(availableSkills[0]);
        }
      } else {
        setError("Not found");
      }
    } catch (err: any) {
      console.error("Failed to load learning path", err);
      setError(err.response?.status === 404 ? "Not found" : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleComplete = async (videoId: number, currentState: boolean) => {
    try {
      // Optimistic update
      if (data) {
        const newData = { ...data };
        const skill = newData.skills[activeTab];
        const videoIndex = skill.videos.findIndex(v => v.id === videoId);
        if (videoIndex !== -1) {
          skill.videos[videoIndex].isCompleted = !currentState;
          setData(newData);
        }
      }

      const capitalizedSection = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      await trackProgress(videoId, capitalizedSection, !currentState);
    } catch (err) {
      console.error("Failed to update progress", err);
      // Rollback on error
      load();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Curating your personalized path...</p>
      </div>
    );
  }

  if (error === "Not found") {
    return (
      <Card className="border-dashed border-2 border-border bg-muted/30">
        <CardBody className="py-20 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <TrendingUp className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="h3">Learning Path Not Generated</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We need to assess your current English proficiency level before we can create a personalized learning plan for you.
            </p>
          </div>
          <Link href="/dashboard/assessment">
            <Button size="lg" className="primary-gradient text-white">
              Take Assessment Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  if (!data || !data.skills) return null;

  const currentSkill = data.skills[activeTab];
  const completedCount = currentSkill?.videos?.filter(v => v.isCompleted).length || 0;
  const totalCount = currentSkill?.videos?.length || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="xl:col-span-1 space-y-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="text-label mb-4 px-2">Skill Domains</h4>
          <nav className="space-y-1">
            {Object.keys(data.skills).map((skill) => {
              const Icon = skillIcons[skill];
              const isActive = activeTab === skill;
              const skillVideos = data.skills[skill].videos;
              const skillCompleted = skillVideos.filter(v => v.isCompleted).length;
              const skillTotal = skillVideos.length;

              return (
                <button
                  key={skill}
                  onClick={() => setActiveTab(skill)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all group font-serif ${
                    isActive
                      ? "bg-primary text-primary-foreground "
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? "text-white" : "group-hover:text-primary"} />
                    <span className="capitalize font-bold">{skill}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/20" : "bg-muted text-muted-foreground"
                  }`}>
                    {skillCompleted}/{skillTotal}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={18} />
            <h5 className="font-bold text-sm">AI Tutor Tip</h5>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            "Studies show that active Recall is 50% more effective. After watching a video, try to summarize it in your own words briefly."
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="xl:col-span-3 space-y-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header & Overall Progress */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                {activeTab && skillIcons[activeTab] && (
                    <div className="p-1 px-1.5 bg-primary/10 rounded-lg">
                      {(() => {
                        const Icon = skillIcons[activeTab];
                        return <Icon size={12} />;
                      })()}
                    </div>
                )}
                <span>Focus Area: {activeTab}</span>
                {data.proficiencyLevel && (
                  <span className={`ml-3 px-2 py-0.5 rounded-full border ${levelConfig[data.proficiencyLevel].color} ${levelConfig[data.proficiencyLevel].border} text-[10px]`}>
                    {levelConfig[data.proficiencyLevel].label}
                  </span>
                )}
              </div>
              <h2 className="h2 capitalize">{activeTab} Mastery</h2>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-4 text-sm font-bold">
                <span className="text-muted-foreground">Path Progress</span>
                <span className="text-primary">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full primary-gradient"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Learning Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* AI Strategy & Gap Analysis */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-info/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-card border border-border p-6 rounded-lg space-y-4">
                  <h4 className="font-bold flex items-center gap-2 text-foreground">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                      <Sparkles size={14} />
                    </div>
                    Strategy & Gap Analysis
                  </h4>
                  
                  {data.competencyGapAnalysis && (
                    <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border">
                      <h5 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                        <User size={12} className="text-primary"/> Proficiency Profile
                      </h5>
                      <p className="text-sm text-foreground leading-relaxed italic">{data.competencyGapAnalysis.proficiency_profile}</p>
                      
                      {data.competencyGapAnalysis.weaknesses && data.competencyGapAnalysis.weaknesses.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                            <TrendingUp size={12} className="text-destructive"/> Targeted Weaknesses
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {data.competencyGapAnalysis.weaknesses.map((w: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 bg-red-500/10 text-red-600 border border-red-500/20 rounded-full text-[10px] font-bold">
                                {w}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap mt-4 border-t border-border pt-4">
                    <h5 className="text-xs font-bold uppercase text-muted-foreground mb-2">Section Deep-Dive</h5>
                    {data.competencyGapAnalysis?.section_analysis?.[activeTab] || currentSkill?.notes || "We're analyzing your assessment to provide specific strategies. For now, focus on the curated lessons below."}
                  </div>
                </div>
              </div>

              {/* Video Lessons List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-foreground">Curated Lessons</h4>
                  <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={12} /> ~45 min total</span>
                    <span className="flex items-center gap-1"><Youtube size={12} /> {totalCount} lessons</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {currentSkill?.videos?.map((v, i) => (
                      <motion.div
                        key={v.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`group relative bg-card border transition-all rounded-lg hover: ${
                          v.isCompleted ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center p-4 gap-4">
                          {/* Completion Toggle */}
                          <button
                            onClick={() => handleToggleComplete(v.id, !!v.isCompleted)}
                            className={`shrink-0 transition-colors ${
                              v.isCompleted ? "text-primary" : "text-muted-foreground hover:text-primary"
                            }`}
                          >
                            {v.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                          </button>

                          {/* Thumbnail */}
                          <div className="relative h-16 w-24 shrink-0 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={v.thubnail || "/video-placeholder.png"}
                              alt="Thumbnail"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/0 transition-all">
                              <PlayCircle size={20} className="text-white drop-shadow-lg" />
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h5 className={`text-sm font-bold truncate group-hover:text-primary transition-colors ${
                                v.isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                            }`}>
                              {v.title || `Mastering ${activeTab} - Lesson ${i + 1}`}
                            </h5>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                <Clock size={10} /> 8-12 mins
                              </span>
                              <span className="text-[10px] font-bold text-primary uppercase">Expert Choice</span>
                            </div>
                          </div>

                          {/* External Link */}
                          <a
                            href={v.videolink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                            title="Watch on YouTube"
                          >
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Side Progress & Mode */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border border-border bg-card overflow-hidden">
                <div className="h-24 bg-linear-to-br from-indigo-500 to-primary p-6 relative">
                    <Sparkles className="absolute top-4 right-4 text-white/20 h-12 w-12" />
                    <h4 className="text-white font-bold text-lg">Practice Mode</h4>
                    <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">Coming Soon</p>
                </div>
                <CardBody className="p-6 space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Interactive practice questions tailored to your {activeTab} level will appear here once you've watched the introductory lessons.
                  </p>
                  <Button disabled variant="outline" className="w-full text-xs font-bold">
                    Unlock Practice Sets
                  </Button>
                </CardBody>
              </Card>

               <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 space-y-4">
                  <h4 className="text-label">{data.curriculumMap ? "Adaptive Sprint Goals" : "Your Next Steps"}</h4>
                  <div className="space-y-4">
                     {data.curriculumMap?.sprints?.length ? (
                       <div className="space-y-3">
                         {data.curriculumMap.sprints.map((sprint: any, i: number) => (
                           <div key={i} className="p-3 bg-white border border-border rounded-lg">
                             <div className="flex items-center gap-1 text-primary font-bold text-[10px] uppercase mb-1">
                               <Clock size={12} /> Week {sprint.week} {sprint.is_remedial ? "(Deep Dive) " : ""}
                             </div>
                             <p className="text-[11px] font-bold text-foreground mb-1">{sprint.goal}</p>
                             {sprint.tasks && (
                               <ul className="text-[10px] text-muted-foreground space-y-1 ml-3 list-disc">
                                 {sprint.tasks.map((task: string, j: number) => <li key={j}>{task}</li>)}
                               </ul>
                             )}
                           </div>
                         ))}
                       </div>
                     ) : null}

                     <div className="flex items-start gap-2 pt-2 border-t border-border/50">
                         <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${totalCount > 0 && completedCount === totalCount ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-primary"}`} />
                         <span className="text-xs font-medium">Watch all {totalCount} curated {activeTab} lessons</span>
                     </div>
                     
                     {progressPercent >= 80 ? (
                       <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 bg-primary/10 border border-primary/20 rounded-lg space-y-3"
                       >
                         <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase">
                           <TrendingUp size={12} />
                           Level Up Available
                         </div>
                         <p className="text-[11px] text-muted-foreground leading-relaxed">
                           You've completed most of your {activeTab} lessons. Ready to measure your improvement and unlock advanced content?
                         </p>
                         <Link href="/dashboard/assessment">
                           <Button size="sm" className="w-full text-[10px] h-8 primary-gradient text-white">
                             Retake Assessment
                           </Button>
                         </Link>
                       </motion.div>
                     ) : (
                       <div className="flex items-start gap-2">
                           <div className="mt-1 h-2 w-2 rounded-full bg-border shrink-0" />
                           <span className="text-xs font-medium text-muted-foreground">Complete 80% coverage to unlock reassessment</span>
                       </div>
                     )}
                     
                     <div className="flex items-start gap-2">
                         <div className="mt-1 h-2 w-2 rounded-full bg-border shrink-0" />
                         <span className="text-xs font-medium text-muted-foreground">Progress to {levelConfig[data.proficiencyLevel === 'easy' ? 'medium' : 'hard']?.label || 'Advanced'} tier</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
