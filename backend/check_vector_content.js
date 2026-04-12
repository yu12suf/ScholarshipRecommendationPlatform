
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', 'password123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function checkVector() {
  try {
    const [rows] = await sequelize.query('SELECT id, title, embedding FROM scholarships WHERE embedding IS NOT NULL LIMIT 1');
    const embed = rows[0].embedding;
    console.log('Title:', rows[0].title);
    console.log('Embedding type:', typeof embed);
    console.log('Is it an array?', Array.isArray(embed));
    if (typeof embed === 'string') {
        process.stdout.write('Sample string Start: ' + embed.substring(0, 50));
    } else if (Array.isArray(embed)) {
        console.log('Array length:', embed.length);
        console.log('First 5 elements:', embed.slice(0, 5));
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkVector();
