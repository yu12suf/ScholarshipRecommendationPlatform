import { Queue, ConnectionOptions } from "bullmq";
import { Redis, RedisOptions } from "ioredis";
import configs from "./configs.js";

// Standard options for ioredis (used by the Express app)
const standardRedisOptions: RedisOptions = {
  host: "redis-13576.c99.us-east-1-4.ec2.cloud.redislabs.com",
  port: 13576,
  username: "default",
  password: "XdorEUN6ODNJZafTq78ukwUpfd9Hag37",
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
