import { connectSequelize } from './src/config/sequelize.js';

async function test() {
  try {
    await connectSequelize();
    console.log('✅ DB connection and sync successful');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

test();
