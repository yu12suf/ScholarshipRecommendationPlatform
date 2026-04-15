import axios from "axios";
import configs from "../config/configs.js";
import { VisaMockInterview, VisaGuideline } from "../models/index.js";

type InterviewEvaluation = {
  confidence_score: number;
  country_specific_flags: string[];
  detailed_feedback: string;
  focus_areas: string[];
  improvements: string[];
  rubric_breakdown?: Record<string, number>;
  evaluation_source?: string;
};

export class VisaService {
  private static toSentence(input: unknown) {
    return String(input || "").replace(/\s+/g, " ").trim();
  }

  private static collectByKeys(root: unknown, wantedKeys: string[]) {
    const keySet = new Set(wantedKeys.map((k) => k.toLowerCase()));
    const out: unknown[] = [];

    const walk = (node: unknown) => {
      if (typeof node === "string") {
        const trimmed = node.trim();
        if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
          try {
            node = JSON.parse(trimmed);
          } catch (e) {
            // ignore parser error
          }
        }
      }

      if (!node || typeof node !== "object") return;

      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }

      Object.entries(node as Record<string, unknown>).forEach(([key, value]) => {
        if (keySet.has(key.toLowerCase())) {
          out.push(value);
        }
        walk(value);
      });
    };

    walk(root);
    return out;
  }

  private static flattenStrings(value: unknown): string[] {
    if (!value) return [];
    if (typeof value === "string") {
      const cleaned = this.toSentence(value);
      return cleaned ? [cleaned] : [];
    }
    if (Array.isArray(value)) {
      return value.flatMap((item) => this.flattenStrings(item));
    }
    if (typeof value === "object") {
      return Object.values(value as Record<string, unknown>).flatMap((item) => this.flattenStrings(item));
    }
    return [];
  }

  private static normalizeEvaluationFromVapi(params: {
    report?: unknown;
    hasRecording: boolean;
    transcript: Array<{ speaker: string; text: string }>;
  }): InterviewEvaluation | null {
    const { report, hasRecording, transcript } = params;
    if (!report || typeof report !== "object") return null;

    const scoreCandidates = this.collectByKeys(report, [
      "confidence_score",
      "confidenceScore",
      "overallScore",
      "score",
      "rating",
      "qualityScore",
    ])
      .map((entry) => Number(entry))
      .filter((n) => Number.isFinite(n));

    const feedbackCandidates = this.collectByKeys(report, [
      "summary",
      "feedback",
      "analysis",
      "evaluation",
      "report",
      "notes",
    ]).flatMap((entry) => this.flattenStrings(entry));

    const flagCandidates = this.collectByKeys(report, [
      "country_specific_flags",
      "countrySpecificFlags",
      "redFlags",
      "riskFlags",
      "flags",
      "concerns",
    ]).flatMap((entry) => this.flattenStrings(entry));

    const focusCandidates = this.collectByKeys(report, [
      "focus_areas",
      "focusAreas",
      "strengths",
      "categories",
      "competencies",
    ]).flatMap((entry) => this.flattenStrings(entry));

    const improvementCandidates = this.collectByKeys(report, [
      "improvements",
      "recommendations",
      "nextSteps",
      "actionItems",
      "suggestions",
    ]).flatMap((entry) => this.flattenStrings(entry));

    const rubricCandidates = this.collectByKeys(report, [
      "rubric_breakdown",
      "rubricBreakdown",
      "score_breakdown",
      "scoreBreakdown",
      "structuredData",
      "structured_data",
      "scores",
      "metrics",
    ]);

    const rubric_breakdown: Record<string, number> = {};
    rubricCandidates.forEach((candidate) => {
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return;
      Object.entries(candidate as Record<string, unknown>).forEach(([key, value]) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return;
        const normalizedKey = this.toSentence(key).replace(/\s+/g, "_").toLowerCase();
        if (!normalizedKey) return;
        rubric_breakdown[normalizedKey] = Math.max(1, Math.min(10, Math.round(numeric)));
      });
    });

    const firstScore = scoreCandidates.at(0);
    const confidence_score = Number.isFinite(firstScore)
      ? Math.max(1, Math.min(10, Math.round(firstScore as number)))
      : null;

    const detailed_feedback =
      feedbackCandidates.find((entry) => entry.length > 20) || feedbackCandidates[0] || "";

    const pickTop = (entries: string[], limit: number) => {
      const deduped = [...new Set(entries.map((e) => this.toSentence(e)).filter(Boolean))];
      return deduped.slice(0, limit);
    };

    if (!confidence_score && !detailed_feedback) {
      return null;
    }

    return {
      confidence_score: confidence_score || (hasRecording ? 7 : 6),
      country_specific_flags: pickTop(flagCandidates, 4),
      detailed_feedback:
        detailed_feedback ||
        `Vapi report was received for ${transcript.length} transcript turns.`,
      focus_areas: pickTop(focusCandidates, 3).length > 0 ? pickTop(focusCandidates, 3) : ["Answer Structure", "Confidence and Tone", "Consistency of Intent"],
      improvements: pickTop(improvementCandidates, 3).length > 0 ? pickTop(improvementCandidates, 3) : [
        "Keep each response concise and directly aligned to the officer question.",
        "Support key statements with one concrete example.",
        "Maintain confident pace and reduce filler phrases.",
      ],
      ...(Object.keys(rubric_breakdown).length > 0 ? { rubric_breakdown } : {}),
      evaluation_source: "vapi_openai_analysis",
    };
  }

  private static normalizeTranscript(transcript?: unknown) {
    if (!Array.isArray(transcript)) {
      return [] as Array<{ speaker: string; text: string }>;
    }

    const entries = transcript
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        const source = item as {
          role?: string;
          speaker?: string;
          text?: string;
          transcript?: string;
          content?: string;
          message?: string | { content?: string; text?: string };
        };

        const speaker = String(source.role || source.speaker || "unknown").toLowerCase();
        let text = source.text || source.transcript || source.content || "";

        if (!text && typeof source.message === "string") {
          text = source.message;
        }

        if (!text && source.message && typeof source.message === "object") {
          text = source.message.content || source.message.text || "";
        }

        const cleaned = String(text || "").trim();
        if (!cleaned) return null;

        return {
          speaker,
          text: cleaned,
        };
      })
      .filter((entry): entry is { speaker: string; text: string } => Boolean(entry));

    return entries;
  }

  private static buildInterviewEvaluation(params: {
    hasRecording: boolean;
    transcript: Array<{ speaker: string; text: string }>;
  }): InterviewEvaluation {
    const { hasRecording, transcript } = params;

    const applicantSpeech = transcript.filter((line) =>
      /(user|caller|human|applicant|student|customer)/i.test(line.speaker),
    );

    const usableSpeech = applicantSpeech.length > 0 ? applicantSpeech : transcript;
    const combinedAnswerText = usableSpeech.map((line) => line.text).join(" ");
    const words = combinedAnswerText.trim().split(/\s+/).filter(Boolean);
    const totalWords = words.length;
    const responseCount = usableSpeech.length;
    const averageWordsPerResponse = responseCount > 0 ? totalWords / responseCount : 0;

    const fillerMatches = combinedAnswerText.match(/\b(um|uh|like|you know|actually|basically|i mean)\b/gi) || [];
    const structureMatches =
      combinedAnswerText.match(/\b(first|second|because|therefore|for example|specifically|in summary|my goal)\b/gi) ||
      [];
    const confidenceMatches =
      combinedAnswerText.match(/\b(i will|i can|i have|i am|my plan|i intend|i prepared)\b/gi) || [];

    const fillerRate = totalWords > 0 ? fillerMatches.length / totalWords : 0;

    let score = 4;
    if (responseCount >= 5) score += 2;
    else if (responseCount >= 3) score += 1;

    if (averageWordsPerResponse >= 10 && averageWordsPerResponse <= 45) score += 2;
    else if (averageWordsPerResponse >= 6) score += 1;

    if (structureMatches.length >= 2) score += 1;
    if (confidenceMatches.length >= 2) score += 1;
    if (hasRecording) score += 1;
    if (fillerRate > 0.06) score -= 1;

    const confidence_score = Math.max(1, Math.min(10, Math.round(score)));

    const country_specific_flags: string[] = [];
    if (responseCount < 3) country_specific_flags.push("Limited response depth from applicant");
    if (averageWordsPerResponse > 0 && averageWordsPerResponse < 8) {
      country_specific_flags.push("Answers were too brief and may appear unprepared");
    }
    if (fillerRate > 0.06) country_specific_flags.push("Frequent filler words reduced clarity");
    if (!hasRecording) country_specific_flags.push("No recording artifact received from provider");

    const focus_areas = [
      "Answer Structure",
      "Confidence and Tone",
      "Consistency of Intent",
    ];

    const improvements = [
      "Use a clear 3-part structure in each answer: intent, reason, expected outcome.",
      "Keep responses concrete with one relevant example per major claim.",
      "Reduce filler words by pausing briefly before answering difficult questions.",
    ];

    const detailed_feedback =
      `Evaluation used session signals from ${responseCount} applicant responses and ${totalWords} total words. ` +
      `Average response length was ${averageWordsPerResponse.toFixed(1)} words with ${fillerMatches.length} filler markers detected. ` +
      (hasRecording
        ? "Audio recording was available and included in reliability checks."
        : "Audio recording was not available, so confidence is based on transcript-only signals.");

    return {
      confidence_score,
      country_specific_flags,
      detailed_feedback,
      focus_areas,
      improvements,
    };
  }

  private static buildSimulationEvaluation(hasRecording: boolean) {
    return {
      confidence_score: hasRecording ? 7 : 5,
      country_specific_flags: hasRecording ? [] : ["Low Signal Data"],
      detailed_feedback:
        "This is a simulation-only assessment. The interview was evaluated without transcript or document checks, focusing on overall session completion and speaking-session quality signals.",
      focus_areas: ["Interview Readiness", "Confidence", "Answer Structure"],
      improvements: [
        "Keep answers direct and structured (intent, reason, outcome).",
        "Maintain a confident pace and avoid over-explaining.",
        "Use specific examples to support key statements.",
      ],
    };
  }

  private static vapiApi = axios.create({
    baseURL: "https://api.vapi.ai",
    headers: {
      Authorization: `Bearer ${configs.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  static async getGuidelines(country: string) {
    return await VisaGuideline.findOne({
      where: { country },
    });
  }

  static async initiateCall(studentInfo: {
    studentId: number;
    studentName: string;
    university: string;
    country: string;
  }) {
    if (!configs.VAPI_API_KEY) {
      throw new Error("VAPI_API_KEY is missing on backend.");
    }

    const { studentId, studentName, university, country } = studentInfo;
    
    if (/localhost|127\.0\.0\.1/i.test(String(configs.SERVER_URL || ""))) {
      console.warn(
        "[VisaService] SERVER_URL points to localhost; Vapi webhook callbacks may not reach this backend from the public internet. " +
        "Using fallback manual sync on frontend polling."
      );
    }
    
    if (configs.VAPI_DEBUG) {
      console.log("[VisaService] initiateCall request", {
        studentId,
        country,
        university,
        model: configs.VAPI_MODEL,
        serverUrl: `${configs.SERVER_URL}/api/visa/webhook/vapi`,
      });
    }
    const guidelines = await this.getGuidelines(country);

    const systemPrompt = `
        Role: Strict Consular Officer for ${country}
        
      Greeting: You MUST start the conversation immediately by greeting the applicant and asking their purpose of travel.
        
        Context:
        - University: ${university}
        - Applicant Name: ${studentName}

        Rules:
        - Be professional, firm, and slightly skeptical.
        - Keep the interview concise: ask 5-7 focused questions.
        - The interview must not exceed 5 minutes.
        - You MUST identify exactly three strengths and three weaknesses of the candidate during the interview for your final analysis.
        - If the user asks to end early, close the interview politely.
        - If the applicant is vague, ask follow-up questions.
        - Focus on spoken interview performance, clarity, confidence, consistency, and credibility.
        - Do not ask the applicant to show passport or upload documents.
        - End only after the full interview is complete, then say: "That is all. You will receive our decision via the registered portal. Good day." and end the call.
      `;

    const assistantPayload = {
      name: `Consular Officer - ${country}`,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en",
      },
      model: {
        provider: "openai",
        model: configs.VAPI_MODEL as string,
        messages: [
          {
            role: "system",
            content: systemPrompt
          }
        ]
      },
      voice: {
        provider: "openai",
        voiceId: "alloy"
      },
      firstMessage: `Good morning. I am the Consular Officer for ${country}. What is the purpose of your trip to ${university}?`,
      maxDurationSeconds: 300,
      analysisPlan: {
        summaryPlan: {
          enabled: true,
            timeoutSeconds: 30,
            messages: [{ role: "system", content: "Summarize interview in 2 concise sentences." }]
          },
          structuredDataPlan: {
            enabled: true,
            timeoutSeconds: 30,
            messages: [{ role: "system", content: "Evaluate the visa interview strictly. You MUST provide all requested array fields with EXACTLY 3 items each." }],
            schema: {
              type: "object",
              properties: {
                confidence_score: { type: "number", description: "1 to 10 score" },
                detailed_feedback: { type: "string", description: "Paragraph feedback" },
                country_specific_flags: { type: "array", items: { type: "string" } },
                focus_areas: { type: "array", items: { type: "string" } },
                improvements: { type: "array", items: { type: "string" } }
              },
              required: ["confidence_score", "detailed_feedback", "country_specific_flags", "focus_areas", "improvements"]
            }
          },
          successEvaluationPlan: {
            enabled: true,
            rubric: "NumericScale",
            timeoutSeconds: 30,
            messages: [{ role: "system", content: "Score performance as pass or fail." }]
          }
        },
        serverUrl: `${configs.SERVER_URL}/api/visa/webhook/vapi`,
        metadata: {
          interviewId: null
        }
      };

    const interview = await VisaMockInterview.create({
      studentId,
      country,
      status: "Pending",
    });

    (assistantPayload.metadata as any).interviewId = interview.id;

    let response;
    try {
      response = await this.vapiApi.post("/assistant", assistantPayload);
      
      // Store the assistant ID temporarily in vapiCallId to allow fallback polling
      await interview.update({ vapiCallId: `asst_${response.data.id}` });
    } catch (error: any) {
      const statusCode = error?.response?.status;
      const responseData = error?.response?.data;
      console.error("[VisaService] Vapi assistant creation failed", {
        statusCode,
        message: error?.message,
        responseData,
      });

      await interview.update({
        status: "Failed",
        aiEvaluation: {
          confidence_score: 0,
          country_specific_flags: ["Assistant Creation Failed"],
          detailed_feedback: "Could not initialize interview session with Vapi.",
          focus_areas: ["Service Availability"],
          improvements: ["Retry in a few moments."],
        },
      });

      throw new Error(
        `Failed to initialize interview session${statusCode ? ` (status ${statusCode})` : ""}.`,
      );
    }

    if (configs.VAPI_DEBUG) {
      const assistantSummary = {
        id: response?.data?.id,
        model: response?.data?.model?.model,
        provider: response?.data?.model?.provider,
        createdAt: response?.data?.createdAt,
      };
      console.log("[VisaService] Vapi assistant created", assistantSummary);
    }

    return {
      assistantId: response.data.id,
      interviewId: interview.id
    };
  }

  static async evaluateCall(payload: {
    vapiCallId?: string;
    transcript?: any[];
    recordingUrl?: string;
    interviewId?: string;
    providerReport?: unknown;
  }) {
    let interview: any = null;
    try {
      const { vapiCallId, transcript, recordingUrl, interviewId } = payload;

      if (vapiCallId) {
        interview = await VisaMockInterview.findOne({ where: { vapiCallId } });
      }

      if (!interview && interviewId) {
        interview = await VisaMockInterview.findByPk(interviewId);
      }

      if (!interview) {
        console.warn("No interview found for webhook payload", {
          vapiCallId,
          interviewId,
        });
        return {
          confidence_score: 0,
          country_specific_flags: ["Interview Correlation Error"],
          detailed_feedback: "Interview session could not be correlated for persistence.",
          focus_areas: ["Session Integrity"],
          improvements: ["Retry the interview session."],
        };
      }

      if (vapiCallId && !interview.vapiCallId) {
        await interview.update({ vapiCallId });
      }

      const normalizedTranscript = this.normalizeTranscript(
        payload.transcript || interview.transcript || [],
      );
      const resolvedRecordingUrl = recordingUrl || interview.audioUrl || null;

      const hasRecording = Boolean(resolvedRecordingUrl);
      const vapiEvaluation = this.normalizeEvaluationFromVapi({
        report: payload.providerReport,
        hasRecording,
        transcript: normalizedTranscript,
      });

      const evaluation = vapiEvaluation
        ? { ...vapiEvaluation, evaluation_source: "vapi_openai_analysis" }
        : normalizedTranscript.length > 0
          ? {
              ...this.buildInterviewEvaluation({
                hasRecording,
                transcript: normalizedTranscript,
              }),
              evaluation_source: "transcript_fallback",
            }
          : {
              confidence_score: 5,
              country_specific_flags: ["No Audio/Transcript Data"],
              detailed_feedback: "The simulation ended without sufficient conversation data to analyze. For a full evaluation, please speak clearly and allow time for the AI to process your answers.",
              focus_areas: ["Call Duration", "Speak Clearly", "Complete the Session"],
              improvements: ["Do not end the call immediately", "Wait for the AI to finish speaking", "Provide detailed answers"],
              evaluation_source: "vapi_error",
            };

      console.log(`[VisaService] Interview ${interview.id} evaluated using ${evaluation.evaluation_source}.`);

      await interview.update({
        transcript: normalizedTranscript,
        audioUrl: resolvedRecordingUrl,
        aiEvaluation: evaluation,
        status: "Evaluated"
      });
      console.log(`Interview ${interview.id} successfully evaluated and updated.`);

      return evaluation;
    } catch (error) {
      console.error("Error in evaluateCall:", error);

      if (interview) {
        try {
          await interview.update({
            status: "Failed",
            aiEvaluation: {
              confidence_score: 0,
              country_specific_flags: ["Evaluation Runtime Error"],
              detailed_feedback: "An internal error occurred while evaluating this interview.",
              focus_areas: ["System Reliability"],
              improvements: ["Retry the interview session."],
            },
          });
        } catch (updateErr) {
          console.error("Failed to persist Failed status for interview:", updateErr);
        }
      }

      throw error;
    }
  }

  static async syncCallFromAPI(interviewId: string) {
    if (!configs.VAPI_API_KEY) return false;
    
    // Fallback sync logic when webhook does not arrive
    const interview = await VisaMockInterview.findByPk(interviewId);
    if (!interview || !interview.vapiCallId) return false;

    if (interview.status === "Evaluated" || interview.status === "Failed") {
      return true;
    }

    try {
      let actualCallId = interview.vapiCallId;

      if (actualCallId.startsWith("asst_")) {
        const assistantId = actualCallId.replace("asst_", "");
        const callsRes = await this.vapiApi.get(`/call?assistantId=${assistantId}`);
        if (callsRes.data && callsRes.data.length > 0) {
          const endedCall = callsRes.data.find((c: any) => c.status === "ended");
          actualCallId = endedCall ? endedCall.id : callsRes.data[0].id;
          await interview.update({ vapiCallId: actualCallId });
        } else {
          return false;
        }
      }

      const response = await this.vapiApi.get(`/call/${actualCallId}`);
      const callData = response.data;
      
      if (!callData || callData.status !== "ended") {
        return false;
      }

      // Vapi analysis taking time to append. Wait up to 15 seconds after call ends.
      const endedAt = new Date(callData.endedAt || Date.now()).getTime();
      const timeSinceEnd = Date.now() - endedAt;
      const hasAnalysisData = callData.analysis && (callData.analysis.structuredData || callData.analysis.summary);

      // Wait up to 45 seconds for Vapi to compute analysis
      if (!hasAnalysisData && timeSinceEnd < 45000) {
        console.log(`[VisaService] Call ended ${timeSinceEnd}ms ago, waiting for analysis data to populate...`);
        return false; // Still waiting for Vapi's report to generate
      }

      console.log(`[VisaService] Syncing call data. Time since end: ${timeSinceEnd}ms. Has analysis: ${!!hasAnalysisData}`, JSON.stringify(callData.analysis || {}, null, 2));

      await this.evaluateCall({
        vapiCallId: actualCallId,
        transcript: callData.transcript,
        recordingUrl: callData.recordingUrl || callData.recording?.url,
        interviewId: interview.id,
        providerReport: callData
      });
      return true;
    } catch (e: any) {
      console.error(`[VisaService] Failed to manually sync call ${interview.vapiCallId}:`, e.message);
      return false;
    }
  }

  static async fetchVapiAnalysisByCallId(vapiCallId: string) {
    if (!configs.VAPI_API_KEY || !vapiCallId) {
      return null;
    }

    try {
      let actualCallId = vapiCallId;

      // During setup we temporarily store assistant IDs in vapiCallId as "asst_<id>".
      if (actualCallId.startsWith("asst_")) {
        const assistantId = actualCallId.replace("asst_", "");
        const callsRes = await this.vapiApi.get(`/call?assistantId=${assistantId}`);
        const calls = Array.isArray(callsRes.data) ? callsRes.data : [];

        if (calls.length === 0) {
          return null;
        }

        const endedCall = calls.find((c: any) => c?.status === "ended");
        actualCallId = endedCall ? endedCall.id : calls[0].id;
      }

      const response = await this.vapiApi.get(`/call/${actualCallId}`);
      const callData = response.data;
      if (!callData) {
        return null;
      }

      return {
        callId: actualCallId,
        status: callData.status,
        analysis: callData.analysis || null,
        transcript: callData.transcript || null,
        recordingUrl: callData.recordingUrl || callData.recording?.url || null,
        raw: callData,
      };
    } catch (error: any) {
      console.warn(`[VisaService] Failed to fetch Vapi analysis for call ${vapiCallId}:`, error?.message || error);
      return null;
    }
  }
}

