
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function run(q) {
  try {
    console.log('RUNNING:', q);
    await sequelize.query(q);
    console.log('OK');
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

async function start() {
    await run('CREATE EXTENSION IF NOT EXISTS vector;');
    await run('ALTER TABLE scholarships ALTER COLUMN embedding TYPE vector(3072) USING (embedding::text::vector);');
    await run('ALTER TABLE students ALTER COLUMN embedding TYPE vector(3072) USING (embedding::text::vector);');
    process.exit(0);
}

start();
