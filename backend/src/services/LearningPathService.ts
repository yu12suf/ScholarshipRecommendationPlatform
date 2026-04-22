import { LearningPathRepository } from "../repositories/LearningPathRepository.js";
import { VideoService } from "../services/VideoService.js";
import { PdfService } from "../services/PdfService.js";
import { Video } from "../models/Video.js";
import { Pdf } from "../models/Pdf.js";
import { LearningPathProgress } from "../models/LearningPathProgress.js";
import { AIService } from "./AIService.js";
import { AssessmentRepository } from "../repositories/AssessmentRepository.js";

export class LearningPathService {
  private static missionData: any = {
    reading: [
      { title: "The Bird's Eye View", objective: "Master timing and test structure to stop feeling rushed." },
      { title: "Skimming vs. Scanning", objective: "Learn to navigate text rapidly without reading every word." },
      { title: "The Paraphrase Key", objective: "Unlock the secret to finding answers hidden in synonyms." },
      { title: "The Logic Traps", objective: "Stop falling for 'Not Given' and 'False' traps in Section 3." },
      { title: "The Full Run", objective: "Practice full-length passages under strict simulated conditions." }
    ],
    listening: [
      { title: "Precision Hearing", objective: "Capture names, numbers, and dates without missing a beat." },
      { title: "Situational Tracking", objective: "Follow directions and map locations without getting lost." },
      { title: "The Echo Trap", objective: "Identify distractors and speaker corrections in real-time." }
    ],
    writing: [
      { title: "The Grammar Engine", objective: "Build the foundation of tenses and subject-verb agreement." },
      { title: "Sentence Architecture", objective: "Combine simple ideas into high-scoring complex sentences." },
      { title: "Describing Trends", objective: "Master the vocabulary for charts, graphs, and line trends." },
      { title: "The 4-Paragraph Blueprint", objective: "Learn the universal structure for a high-scoring Task 2 essay." },
      { title: "Idea Generation", objective: "Never run out of points to write about in Task 2 brainstorming." }
    ],
    speaking: [
      { title: "The Icebreaker", objective: "Master Part 1 confidence for hometown, hobbies, and studies." },
      { title: "Clear Comms", objective: "Reduce filler words and improve natural pronunciation flow." },
      { title: "The Storyteller", objective: "Master the Part 2 cue card and talk for 2 minutes non-stop." },
      { title: "Opinion Logic", objective: "Structure abstract arguments in Part 3 using the A.R.E method." }
    ]
  };

  /**
   * Maps overall band score to a difficulty level (easy, medium, hard).
   */
  private static mapScoreToLevel(
    overallBand: number,
  ): "easy" | "medium" | "hard" {
    if (overallBand < 5.0) return "easy";
    if (overallBand < 7.0) return "medium";
    return "hard";
  }

  /**
   * Generates a new learning path or updates existing one based on evaluation.
   */
  static async generateForStudent(
    studentId: number,
    evaluation: any,
    examType: "IELTS" | "TOEFL" = "IELTS",
  ) {
    const overallBand = evaluation.overall_band || 0;
    const level = this.mapScoreToLevel(overallBand);
    const normalizedExamType =
      examType && examType.toUpperCase() === "TOEFL" ? "TOEFL" : "IELTS";

    // 1. Fetch 5 videos and 5 pdfs per skill matching the student's level and exam type
    const [videoMap, pdfMap] = await Promise.all([
      VideoService.getAllPerType(level, normalizedExamType),
      PdfService.getFivePerType(level, normalizedExamType)
    ]);

    const videoSections = {
      reading: videoMap["reading"]?.map((v) => v.id) || [],
      listening: videoMap["listening"]?.map((v) => v.id) || [],
      writing: videoMap["writing"]?.map((v) => v.id) || [],
      speaking: videoMap["speaking"]?.map((v) => v.id) || [],
    };

    const pdfSections = {
      reading: pdfMap["reading"]?.map((p) => p.id) || [],
      listening: pdfMap["listening"]?.map((p) => p.id) || [],
      writing: pdfMap["writing"]?.map((p) => p.id) || [],
      speaking: pdfMap["speaking"]?.map((p) => p.id) || [],
    };

    // 2. Extract skill-based notes from AI evaluation
    // We expect AI to return section_notes, if not, we fallback to general feedback
    const aiNotes = evaluation.section_notes || {};
    const generalFeedback =
      evaluation.feedback_report ||
      "Continue practicing all skills.";

    const noteSections = {
      reading: aiNotes.reading || generalFeedback,
      listening: aiNotes.listening || generalFeedback,
      writing: aiNotes.writing || generalFeedback,
      speaking: aiNotes.speaking || generalFeedback,
    };

    // 3. Extract Learning Mode Sections (Practice Questions)
    let rawLearningMode = evaluation.learning_mode || {};
    
    // Normalize keys (handle AI casing inconsistency)
    const learningModeSections: any = {
      reading: rawLearningMode.reading || rawLearningMode.Reading || [],
      listening: rawLearningMode.listening || rawLearningMode.Listening || [],
      writing: rawLearningMode.writing || rawLearningMode.Writing || [],
      speaking: rawLearningMode.speaking || rawLearningMode.Speaking || [],
    };

    // Ensure at least one fallback question if section is empty
    const skills: ('reading' | 'listening' | 'writing' | 'speaking')[] = ['reading', 'listening', 'writing', 'speaking'];
    for (const skill of skills) {
      const section = learningModeSections[skill];
      if (!section || (Array.isArray(section) && section.length === 0)) {
        console.log(`[LearningPathService] Applying diagnostic fallback for ${skill}`);
        learningModeSections[skill] = [
          {
            question: `Review your diagnostic results for ${skill} and focus on areas with the highest competency gap.`,
            options: ["I have reviewed it", "I will review it later"],
            correct_answer: 0,
            explanation: "Reflection is the first step to mastery."
          }
        ];
      }
    }

    // 4. Extract Competency Gap and Curriculum Map
    const competencyGapAnalysis =
      evaluation.competency_gap_analysis || null;
    const curriculumMap =
      evaluation.adaptive_curriculum_map || null;

    // 5. Persist the learning path (resets all progress for fresh start)
    await LearningPathRepository.upsert(studentId, {
      videoSections,
      pdfSections,
      noteSections,
      learningModeSections,
      competencyGapAnalysis,
      curriculumMap,
      proficiencyLevel: level,
      examType: normalizedExamType,
      currentProgressPercentage: 0,
    });
  }

  static async getFormattedPath(studentId: number) {
    const path = await LearningPathRepository.findByStudentId(studentId);
    if (!path) return null;

    const skills = ["reading", "listening", "writing", "speaking"];
    const result: any = {};
    const updatedLearningMode: any = {};
    let totalItems = 0;
    let completedItems = 0;

    // Faster optimization: fetch all progress records at once for this student
    const allProgress = await LearningPathProgress.findAll({
      where: { studentId }
    });

    for (const skill of skills) {
      const sectionStr = skill.charAt(0).toUpperCase() + skill.slice(1);
      const skillProgress = allProgress.filter(p => p.section === sectionStr && p.isCompleted);

      // --- 1. Videos ---
      const videoIds = (path.videoSections as any)[skill] || [];
      const videosProgress = await Promise.all(
        videoIds.map(async (id: number) => {
          const video = await VideoService.getById(id);
          if (!video) return null;

          const isCompleted = skillProgress.some(p => p.videoId === id);
          totalItems++;
          if (isCompleted) completedItems++;

          return {
            ...video.get({ plain: true }),
            isCompleted: isCompleted,
          };
        }),
      );

      // --- 2. PDFs ---
      const pdfIds = (path as any).pdfSections?.[skill] || [];
      const pdfsProgress = await Promise.all(
        pdfIds.map(async (id: number) => {
          const pdf = await PdfService.getById(id);
          if (!pdf) return null;

          // Note: Using videoId column for PDF IDs for now to avoid migration if possible, 
          // but better to have a generic resourceId. For now, let's just track by ID.
          // Wait, if I use videoId, it might conflict. 
          // I'll check if I should use isNote or a new column.
          // For now, let's just not track PDF completion or assume it's like a Note.
          const isCompleted = false; 

          return {
            ...pdf.get({ plain: true }),
            isCompleted,
          };
        }),
      );

      // --- 2. Practice Questions ---
      const skillData = (path.learningModeSections as any)[skill];
      let skillQuestions: any[] = [];
      let extraData: any = {};

      if (Array.isArray(skillData)) {
        skillQuestions = skillData;
      } else if (skillData && Array.isArray(skillData.questions)) {
        skillQuestions = skillData.questions;
        // Preserve other data like script and audio_base64
        const { questions, ...rest } = skillData;
        extraData = rest;
      }

      const updatedQuestions = skillQuestions.map((q: any, index: number) => {
        const savedProgress = skillProgress.find(p => p.questionIndex === index);
        const isCompleted = !!savedProgress;
        
        totalItems++;
        if (isCompleted) completedItems++;
        
        return { 
          ...q, 
          isCompleted,
          userAnswer: savedProgress?.answerText || null
        };
      });

      if (Object.keys(extraData).length > 0) {
        updatedLearningMode[skill] = {
          ...extraData,
          questions: updatedQuestions,
        };
      } else {
        updatedLearningMode[skill] = updatedQuestions;
      }

      // --- 3. Notes ---
      const isNoteCompleted = skillProgress.some(p => p.isNote === true);
      totalItems++; // 1 Note per skill section
      if (isNoteCompleted) completedItems++;

      // --- 4. Group into Missions ---
      const missions: any[] = [];
      const skillMissions = this.missionData[skill] || [];
      const validVideos = videosProgress.filter((v) => v !== null);

      for (let i = 0; i < skillMissions.length; i++) {
        const missionInfo = skillMissions[i];
        const start = i * 5;
        const end = Math.min(start + 5, validVideos.length);
        
        if (start < validVideos.length) {
          const missionVideos = validVideos.slice(start, end);
          const isMissionCompleted = missionVideos.every(v => v.isCompleted);
          
          missions.push({
            title: missionInfo.title,
            objective: missionInfo.objective,
            videos: missionVideos,
            isCompleted: isMissionCompleted
          });
        }
      }

      result[skill] = {
        videos: validVideos,
        pdfs: pdfsProgress.filter((p) => p !== null),
        notes: (path.noteSections as any)[skill] || "",
        isNoteCompleted,
        missions
      };
    }

    const progressPercentage =
      totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    
    // Update the record in the database
    if (path.currentProgressPercentage !== progressPercentage) {
      path.currentProgressPercentage = progressPercentage;
      await path.save();
    }

    return {
      proficiencyLevel: path.proficiencyLevel,
      examType: path.examType,
      skills: result,
      learningMode: updatedLearningMode,
      competencyGapAnalysis: path.competencyGapAnalysis,
      curriculumMap: path.curriculumMap,
      current_progress_percentage: progressPercentage,
    };
  }

  /**
   * Evaluates a specific speaking practice question.
   */
  static async evaluateSpeakingPractice(
    studentId: number,
    questionIndex: number,
    audioBase64: string,
    mimeType: string,
  ) {
    const path = await LearningPathRepository.findByStudentId(studentId);
    if (!path) throw new Error("Learning path not found.");

    const speakingData = (path.learningModeSections as any).speaking;
    const speakingPrompt = speakingData?.[questionIndex];

    if (!speakingPrompt) {
      throw new Error("Speaking prompt not found at this index.");
    }

    const promptText = speakingPrompt.prompt || speakingPrompt.question;

    const evaluation = await AIService.evaluateSpeaking(
      promptText,
      audioBase64,
      mimeType,
      (path.examType as "IELTS" | "TOEFL") || "IELTS",
    );

    // Mark this specific speaking practice question as completed
    await LearningPathProgress.findOrCreate({
      where: {
        studentId,
        questionIndex,
        section: "Speaking",
      },
      defaults: {
        isCompleted: true,
      },
    }).then(([progress, created]) => {
      if (!created) progress.update({ isCompleted: true });
    });

    return evaluation;
  }

  /**
   * Generates a mini unit test for a specific skill and level.
   */
  static async generateUnitTest(skill: string, level: string, examType: string = 'IELTS') {
    const prompt = `
      Role: Senior ${examType} Examiner
      Task: Generate a high-stakes Unit Test for the ${skill} section.
      Difficulty: ${level}
      
      Requirement: 
      - Provide 5 multiple-choice questions.
      - Each question must have 4 options and 1 correct answer.
      - Include a brief explanation for the correct answer.
      
      Return ONLY a valid JSON object in this schema:
      {
        "skill": "${skill}",
        "questions": [
          {
            "question": "string",
            "options": ["A", "B", "C", "D"],
            "correct_answer": 0,
            "explanation": "string"
          }
        ]
      }
    `;

    const response = await AIService.generateJSON(prompt);
    return response;
  }

  /**
   * Evaluates unit test results and marks module as mastered if successful.
   */
  static async evaluateUnitTest(studentId: number, skill: string, responses: any[]) {
    // Logic: Simple score calculation or AI evaluation
    // For Unit Tests (MCQs), we can just check indices
    let correctCount = 0;
    for (const res of responses) {
      if (res.isCorrect) correctCount++;
    }

    const score = (correctCount / responses.length) * 100;
    const passed = score >= 80; // 80% to pass

    if (passed) {
      // Mark this section as mastered in LearningPathProgress
      await LearningPathProgress.findOrCreate({
        where: {
          studentId,
          section: skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase(),
          isNote: false, // Using a specific flag or just completion
        },
        defaults: {
          isCompleted: true,
        }
      });
    }

    return {
      score,
      passed,
      feedback: passed ? "Excellent work! You have mastered this module." : "You're close! Review the materials and try again."
    };
  }
}
