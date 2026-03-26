import { Worker } from "bullmq";
import { redisOptions } from "../config/redis.js";
import { AssessmentService } from "../services/AssessmentService.js";

export const assessmentWorker = new Worker(
    "assessment-queue",

    async (job) => {
        const { testId, blueprint, responses, studentId, audioData } = job.data;
        console.log(`Processing evaluation for test_id: ${testId}`);

        try {
            const evaluation = await AssessmentService.evaluateAssessment(testId, blueprint, responses, studentId, audioData);

            console.log(`✅ Evaluation complete for test_id: ${testId}`);
            return evaluation;
        } catch (error) {
            console.error(`❌ Evaluation failed for test_id: ${testId}:`, error);
            throw error;
        }
    },
    { connection: redisOptions }
);

assessmentWorker.on("completed", (job) => {
    console.log(`Job ${job.id} has completed!`);
});

assessmentWorker.on("failed", (job, err) => {
    console.log(`Job ${job?.id} has failed with ${err.message}`);
});
