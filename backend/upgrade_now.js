
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', 'password123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: true
});

async function upgrade() {
    console.log('START');
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('EXTENSION OK');
    await sequelize.query('ALTER TABLE scholarships ALTER COLUMN embedding TYPE vector(3072) USING (embedding::text::vector);');
    console.log('SCHOLARSHIPS OK');
    await sequelize.query('ALTER TABLE students ALTER COLUMN embedding TYPE vector(3072) USING (embedding::text::vector);');
    console.log('STUDENTS OK');
    process.exit(0);
}

upgrade().catch(err => {
    console.error('CRASHED:', err.message);
    process.exit(1);
});
