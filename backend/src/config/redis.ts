import { Queue, ConnectionOptions } from "bullmq";
import { Redis, RedisOptions } from "ioredis";
import configs from "./configs.js";

// Standard options for ioredis (used by the Express app)
const standardRedisOptions: RedisOptions = {
  host: configs.REDIS_HOST,
  port: configs.REDIS_PORT,
  password: configs.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 0, // BullMQ recommendation
  connectTimeout: 5000, 
  retryStrategy(times) {
    if (times > 3) {
      console.warn("⚠️ Redis connection failed after 3 retries. Redis-dependent features will be disabled.");
      return null; // stop retrying
    }
    return Math.min(times * 200, 1000);
  }
};

let redisAvailable = false;

export const redisConnection = new Redis(standardRedisOptions);

redisConnection.on("connect", () => {
  redisAvailable = true;
  console.log("✅ Redis connected successfully");
});

redisConnection.on("error", (err) => {
  redisAvailable = false;
  console.error("❌ Redis connection error:", err.message);
});

// Options specifically required for BullMQ workers and queues
export const redisOptions: any = {
  ...standardRedisOptions,
  maxRetriesPerRequest: null,
};

// Only initialize queue if possible, otherwise we handle it in services
export const assessmentQueue = new Queue("assessment-queue", {
  connection: redisOptions,
});

export const isRedisAvailable = () => redisAvailable;
