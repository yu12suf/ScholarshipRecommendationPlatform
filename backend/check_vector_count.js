
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function checkVector() {
  try {
    const [rows] = await sequelize.query('SELECT embedding FROM scholarships WHERE embedding IS NOT NULL LIMIT 1');
    const embed = rows[0].embedding;
    if (typeof embed === 'string') {
        const parts = embed.replace('[', '').replace(']', '').split(',');
        console.log('Split parts length:', parts.length);
        console.log('Sample elements:', parts.slice(0, 5));
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkVector();
