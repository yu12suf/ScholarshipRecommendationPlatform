
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function checkVector() {
  try {
    const [rows] = await sequelize.query('SELECT embedding FROM scholarships WHERE embedding IS NOT NULL LIMIT 1');
    if (rows.length > 0) {
      console.log('Vector length found:', rows[0].embedding.length);
    } else {
      console.log('No embeddings found in the DB.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkVector();
