import { Queue, ConnectionOptions } from "bullmq";
import { Redis, RedisOptions } from "ioredis";
import configs from "./configs.js";

// Standard options for ioredis (used by the Express app)
const standardRedisOptions: RedisOptions = {
  host: configs.REDIS_HOST,
  port: configs.REDIS_PORT,
  password: configs.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 5, // Fails gracefully instead of hanging forever
};

export const redisConnection = new Redis(standardRedisOptions);

// Options specifically required for BullMQ workers and queues
export const redisOptions: any = {
  ...standardRedisOptions,
  maxRetriesPerRequest: null,
};

redisConnection.on("connect", () => console.log("✅ Redis connected successfully"));
redisConnection.on("error", (err) => console.error("❌ Redis connection error:", err));

export const assessmentQueue = new Queue("assessment-queue", {
  connection: redisOptions,
});
