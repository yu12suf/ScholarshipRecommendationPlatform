
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', 'password123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function run() {
  try {
    console.log('UPGRADING WITH JSON EXTRACTION...');
    // We use ->> 0 or #>> '{}' to get the raw string without extra quotes if it was stored as a JSON string
    await sequelize.query("ALTER TABLE scholarships ALTER COLUMN embedding TYPE vector(3072) USING ( (embedding #>> '{}')::vector );");
    await sequelize.query("ALTER TABLE students ALTER COLUMN embedding TYPE vector(3072) USING ( (embedding #>> '{}')::vector );");
    console.log('SUCCESS');
  } catch (err) {
    console.log('FAILED:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
