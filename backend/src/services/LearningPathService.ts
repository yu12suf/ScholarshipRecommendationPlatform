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
      PdfService.findAllPerType(level, normalizedExamType)
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

          const isCompleted = allProgress.some(p => p.pdfId === id);
          totalItems++;
          if (isCompleted) completedItems++;

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
      const validPdfs = pdfsProgress.filter((p) => p !== null);

      for (let i = 0; i < skillMissions.length; i++) {
        const missionInfo = skillMissions[i];
        
        // Videos: 5 per mission
        const videoStart = i * 5;
        const videoEnd = Math.min(videoStart + 5, validVideos.length);
        const missionVideos = videoStart < validVideos.length ? validVideos.slice(videoStart, videoEnd) : [];

        // PDFs: 3 per mission
        const pdfStart = i * 3;
        const pdfEnd = Math.min(pdfStart + 3, validPdfs.length);
        const missionPdfs = pdfStart < validPdfs.length ? validPdfs.slice(pdfStart, pdfEnd) : [];
        
        if (missionVideos.length > 0 || missionPdfs.length > 0) {
          const isPracticeCompleted = updatedLearningMode[skill]?.questions?.some((q: any) => q.isCompleted) || 
                                      (Array.isArray(updatedLearningMode[skill]) && updatedLearningMode[skill].some((q: any) => q.isCompleted)) ||
                                      (updatedLearningMode[skill] && (updatedLearningMode[skill].prompt || updatedLearningMode[skill].question) && updatedLearningMode[skill].isCompleted);
                                      
          const normalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
          const unitTestEntry = allProgress.find(p => p.section === normalizedSkill && p.isUnitTest && p.missionIndex === i);
          const isUnitTestCompleted = unitTestEntry ? unitTestEntry.isCompleted : false;

          const isMissionCompleted = (missionVideos.length > 0 ? missionVideos.every(v => v.isCompleted) : true) && 
                                     (missionPdfs.length > 0 ? missionPdfs.every(p => p.isCompleted) : true) &&
                                     isPracticeCompleted &&
                                     isUnitTestCompleted;
          
          missions.push({
            title: missionInfo.title,
            objective: missionInfo.objective,
            videos: missionVideos,
            pdfs: missionPdfs,
            isCompleted: !!isMissionCompleted,
            isUnitTestCompleted: !!isUnitTestCompleted
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

    // --- Weighted Overall Progress Calculation ---
    let totalSkillProgressSum = 0;
    for (const skill of skills) {
      const skillData = result[skill];
      const missions = skillData.missions;
      if (missions && missions.length > 0) {
        let skillWeightedSum = 0;
        for (const mission of missions) {
          // Video: 40% | PDF: 20% | Practice: 40%
          const videoRatio = mission.videos.length > 0 
            ? mission.videos.filter((v: any) => v.isCompleted).length / mission.videos.length 
            : 1.0; 
          
          const pdfRatio = mission.pdfs.length > 0 
            ? mission.pdfs.filter((p: any) => p.isCompleted).length / mission.pdfs.length 
            : 1.0;

          // Practice calculation
          const skillLm = updatedLearningMode[skill];
          let practiceRatio = 0;
          if (Array.isArray(skillLm)) {
            practiceRatio = skillLm.length > 0 ? skillLm.filter((q: any) => q.isCompleted).length / skillLm.length : 0;
          } else if (skillLm && skillLm.questions) {
            practiceRatio = skillLm.questions.length > 0 ? skillLm.questions.filter((q: any) => q.isCompleted).length / skillLm.questions.length : 0;
          } else if (skillLm && (skillLm.prompt || skillLm.question)) {
            practiceRatio = skillLm.isCompleted ? 1 : 0;
          }

          const missionProgress = (videoRatio * 0.4) + (pdfRatio * 0.2) + (practiceRatio * 0.4);
          skillWeightedSum += (missionProgress / missions.length);
        }
        totalSkillProgressSum += (skillWeightedSum / skills.length);
      }
    }

    const progressPercentage = Math.round(totalSkillProgressSum * 100);
    
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
    const isReading = skill.toLowerCase().includes('reading');
    const isListening = skill.toLowerCase().includes('listening');

    const prompt = `
      Role: Senior ${examType} Examiner
      Task: Generate a high-stakes Unit Test for the ${skill} section.
      Difficulty: ${level}
      
      Requirement: 
      ${isReading ? "- Provide a 400-500 word academic Reading Passage." : ""}
      ${isListening ? "- Provide a detailed Listening Script (conversation or lecture) for the audio section." : ""}
      - Provide 5 multiple-choice questions based on the ${isReading ? "passage" : (isListening ? "script" : "task")}.
      - Each question must have 4 options and 1 correct answer.
      - Include a brief explanation for the correct answer.
      
      Return ONLY a valid JSON object in this schema:
      {
        "skill": "${skill}",
        ${isReading ? '"passage": "string",' : ""}
        ${isListening ? '"script": "string",' : ""}
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
   * Dynamically generates a full mission content (Practice Drill & Unit Test) using AI,
   * with sequentially varying question types based on the missionIndex.
   */
  static async generateMissionContent(skill: string, level: string, topic: string, missionIndex: number = 0) {
    const isReading = skill.toLowerCase().includes('reading');
    const isListening = skill.toLowerCase().includes('listening');
    const isWriting = skill.toLowerCase().includes('writing');
    const isSpeaking = skill.toLowerCase().includes('speaking');
    
    // Standard IELTS Question Types Ordered by Mission Sequence
    const readingTypes = ['R_MCQ', 'R_TFNG', 'R_HEAD', 'R_MATCH', 'R_FILL', 'R_DIAG'];
    const listeningTypes = ['L_MCQ', 'L_MATCH', 'L_FORM', 'L_MAP', 'L_FLOW'];
    const writingTypes = ['W_FIX', 'W_MERGE', 'W_VOCAB', 'W_STRUCTURE', 'W_IDEA'];
    const speakingTypes = ['S_PART1', 'S_PART2', 'S_PART3', 'S_MIXED'];
    
    let types = readingTypes;
    if (isListening) types = listeningTypes;
    if (isWriting) types = writingTypes;
    if (isSpeaking) types = speakingTypes;
    
    // Map the mission index to the specific question type, cycling back if index exceeds array length
    const safeIndex = Math.max(0, missionIndex) % types.length;
    const type1 = types[safeIndex];
    
    // Unit Test gets a slightly different type to mix it up, usually the next one in the sequence
    const nextIndex = (safeIndex + 1) % types.length;
    const type2 = types[nextIndex];

    const prompt = `
      Role: Senior IELTS/TOEFL Content Architect
      Task: Generate a dynamic, highly accurate Mission for the ${skill} section.
      Difficulty: ${level}
      Topic/Theme: ${topic || "Academic Subject"}
      
      Requirements: 
      ${isReading ? "- Provide a 300-400 word academic Reading Passage." : ""}
      ${isListening ? "- Provide a detailed Listening Script (conversation or lecture). Add a distractor (speaker corrects themselves) to trick the student." : ""}
      ${isWriting ? "- Provide a short writing prompt or scenario (e.g., a paragraph with deliberate errors, or a Task 1 graph description)." : ""}
      ${isSpeaking ? "- Provide a Speaking Examiner prompt (e.g., questions about hometown, a Cue Card, or abstract discussion questions)." : ""}
      - The Practice Drill must use the ${type1} question type and contain 2 questions.
      - The Unit Test must use the ${type2} question type and contain 3 questions.
      - For each question, provide the correct answer and a 'feedbackTip' explaining why it's correct or explaining the trap.
      
      Return ONLY a valid JSON object in this schema:
      {
        "title": "Dynamic Mission: ${topic}",
        "level": "${level}",
        ${isReading ? '"passage": "string",' : ""}
        ${isListening ? '"script": "string", "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",' : ""}
        ${isWriting ? '"writingPrompt": "string",' : ""}
        ${isSpeaking ? '"speakingPrompt": "string",' : ""}
        "practiceDrill": {
          "type": "${type1}",
          "questions": [
            { "q": "Question text", "options": ["A", "B", "C"], "answer": "correct string/option", "distractor": "optional string to trick them", "feedbackTip": "AI generated explanation" }
          ]
        },
        "unitTest": {
          "type": "${type2}",
          "questions": [
            { "q": "Question text", "options": ["A", "B"], "answer": "correct string/option", "feedbackTip": "AI generated explanation" }
          ]
        }
      }
    `;

    const response = await AIService.generateJSON(prompt);
    return response;
  }

  /**
   * Evaluates unit test results and marks module as mastered if successful.
   */
  static async evaluateUnitTest(studentId: number, skill: string, responses: any[], missionIndex: number) {
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
          section: skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase() as any,
          isUnitTest: true,
          missionIndex: missionIndex
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
