
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', 'password123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function run() {
  try {
    console.log('UPGRADING WITH TRIM...');
    await sequelize.query("ALTER TABLE scholarships ALTER COLUMN embedding TYPE vector(3072) USING ( TRIM(BOTH '\"' FROM embedding::text)::vector );");
    await sequelize.query("ALTER TABLE students ALTER COLUMN embedding TYPE vector(3072) USING ( TRIM(BOTH '\"' FROM embedding::text)::vector );");
    console.log('SUCCESS');
  } catch (err) {
    console.log('FAILED:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
