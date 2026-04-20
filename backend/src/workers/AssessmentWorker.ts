import { Worker } from "bullmq";
import { redisOptions } from "../config/redis.js";
import { AssessmentService } from "../services/AssessmentService.js";

console.log("📂 [AssessmentWorker] Module initialization started...");

/**
 * AssessmentWorker evaluates student responses using AI.
 * It is created unconditionally so it can attach as soon as Redis is reachable.
 */
export const assessmentWorker = new Worker(
  "assessment-queue",
  async (job) => {
    const { testId, blueprint, responses, studentId, audioData } = job.data;
    console.log(`[AssessmentWorker] 🚀 Picking up job ${job.id} for test_id: ${testId}`);

    try {
      const evaluation = await AssessmentService.evaluateAssessment(
        testId,
        blueprint,
        responses,
        studentId,
        job, // Pass job for incremental progress updates
        audioData,
      );
      console.log(`✅ Evaluation complete for test_id: ${testId}`);
      return evaluation;
    } catch (error) {
      console.error(`❌ Evaluation failed for test_id: ${testId}:`, error);
      throw error;
    } finally {
      // Job completion/failure handled by the worker
    }
  },
  {
    connection: redisOptions,
    concurrency: 1,
    lockDuration: 600000, 
    maxStalledCount: 3,
    stalledInterval: 30000
  },
);

console.log("🛠️ AssessmentWorker module loaded and worker instance created.");

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
