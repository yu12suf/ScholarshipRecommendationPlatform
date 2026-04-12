
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', 'password123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function checkVectorScores() {
  try {
    // Get a student's embedding
    const [students] = await sequelize.query('SELECT user_id, embedding FROM students WHERE embedding IS NOT NULL LIMIT 1');
    if (students.length === 0) return console.log('No student embeddings.');
    
    const sid = students[0].user_id;
    const vectorStr = students[0].embedding; // It's already a string in our test
    
    console.log(`Calculating matches for student ${sid}...`);
    const [matches] = await sequelize.query(`
        SELECT id, title,
               (1 - (embedding <=> '${vectorStr}'::vector)) * 100 as score
        FROM scholarships 
        WHERE embedding IS NOT NULL
        ORDER BY score DESC
        LIMIT 5
    `);
    
    console.log('Top Vector Matches:');
    matches.forEach(m => console.log(`- ${m.title}: ${m.score}%`));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkVectorScores();
