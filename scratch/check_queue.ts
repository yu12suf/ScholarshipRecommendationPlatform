import { assessmentQueue } from "../backend/src/config/redis.js";

async function checkQueue() {
    const waiting = await assessmentQueue.getWaitingCount();
    const active = await assessmentQueue.getActiveCount();
    const failed = await assessmentQueue.getFailedCount();
    const completed = await assessmentQueue.getCompletedCount();
    
    console.log(`Queue Stats:
    Waiting: ${waiting}
    Active: ${active}
    Failed: ${failed}
    Completed: ${completed}
    `);
    
    const jobs = await assessmentQueue.getJobs(['waiting', 'active']);
    for (const job of jobs) {
        console.log(`Job ID: ${job.id}, State: ${await job.getState()}, Name: ${job.name}`);
    }
    
    process.exit(0);
}

checkQueue().catch(console.error);
