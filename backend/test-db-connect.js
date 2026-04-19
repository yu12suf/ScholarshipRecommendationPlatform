import { connectSequelize } from './src/config/sequelize.js';

console.log('Testing database connection...');
connectSequelize().then(() => {
  console.log('✅ Connection test completed successfully');
  process.exit(0);
}).catch(err => {
  console.error('❌ Connection failed:', err);
  process.exit(1);
});
