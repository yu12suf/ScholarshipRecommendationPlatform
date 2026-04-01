
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function upgradeToVector() {
  try {
    console.log('Ensuring pgvector is enabled...');
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');
    
    console.log('Converting scholarships.embedding to vector(3072)...');
    await sequelize.query('ALTER TABLE scholarships ALTER COLUMN embedding TYPE vector(3072) USING (embedding::text::vector);');
    
    console.log('Converting students.embedding to vector(3072)...');
    await sequelize.query('ALTER TABLE students ALTER COLUMN embedding TYPE vector(3072) USING (embedding::text::vector);');
    
    console.log('Creating HNSW index on scholarships for performance...');
    // Drop old index if exists (not strictly necessary but safe if we are re-running)
    try { await sequelize.query('DROP INDEX IF EXISTS scholarships_embedding_idx;'); } catch (e) {}
    await sequelize.query('CREATE INDEX scholarships_embedding_idx ON scholarships USING hnsw (embedding vector_cosine_ops);');
    
    console.log('SUCCESS: Database successfully upgraded to use native pgvector columns!');
  } catch (err) {
    console.error('Error during upgrade:', err.message);
  } finally {
    process.exit(0);
  }
}

upgradeToVector();
