import { Worker } from "bullmq";
import { redisOptions } from "../config/redis.js";
import { AssessmentService } from "../services/AssessmentService.js";

/**
 * AssessmentWorker evaluates student responses using AI.
 * It is created unconditionally so it can attach as soon as Redis is reachable.
 */
export const assessmentWorker = new Worker(
  "assessment-queue",
  async (job) => {
    const { testId, blueprint, responses, studentId, audioData } = job.data;
    console.log(`Processing evaluation for test_id: ${testId}`);

    // Keep observable job activity during long-running LLM calls.
    const heartbeat = setInterval(() => {
      job
        .updateProgress({
          status: "processing",
          testId,
          timestamp: Date.now(),
        })
        .catch(() => {
          // Ignore heartbeat update errors; worker completion/failure will handle final state.
        });
    }, 15000);

    try {
      const evaluation = await AssessmentService.evaluateAssessment(
        testId,
        blueprint,
        responses,
        studentId,
        audioData,
      );
      console.log(`Evaluation complete for test_id: ${testId}`);
      return evaluation;
    } catch (error) {
      console.error(` Evaluation failed for test_id: ${testId}:`, error);
      throw error;
    } finally {
      clearInterval(heartbeat);
    }
  },
  {
    connection: redisOptions,
    concurrency: 1,
    lockDuration: 10 * 60 * 1000,
    stalledInterval: 60 * 1000,
    maxStalledCount: 3,
  },
);

assessmentWorker.on("completed", (job) => {
  console.log(`Job ${job.id} has completed!`);
});

assessmentWorker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});

let lastConnError = "";
assessmentWorker.on("error", (err) => {
  if (err.message.includes("ETIMEDOUT") || err.message.includes("ECONNREFUSED")) {
    if (lastConnError !== err.message) {
      console.warn(`AssessmentWorker Redis unavailable (${err.message}) - sync fallback active.`);
      lastConnError = err.message;
    }
  } else {
    console.error("AssessmentWorker error:", err.message);
  }
});
