import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

async function flush() {
  try {
    console.log('Flushing Redis...');
    await redis.flushall();
    console.log('✅ Redis flushed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to flush Redis:', err);
    process.exit(1);
  }
}

flush();
