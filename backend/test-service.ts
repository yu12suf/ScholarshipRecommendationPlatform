import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

import { CounselorService } from './src/services/CounselorService.js';
import { connectSequelize } from './src/config/sequelize.js';

async function run() {
  try {
    await connectSequelize();
    // Assuming counselor ID 4 has reviews, since we saw that in the earlier test
    const reviews = await CounselorService.getReviews(4);
    console.log("FINAL OUTPUT:", JSON.stringify(reviews, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
