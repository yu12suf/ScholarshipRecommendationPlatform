
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function run() {
  try {
    console.log('CREATING INDEX...');
    await sequelize.query('CREATE INDEX IF NOT EXISTS scholarships_embedding_idx ON scholarships USING hnsw (embedding vector_cosine_ops);');
    console.log('SUCCESS');
  } catch (err) {
    console.log('FAILED:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
