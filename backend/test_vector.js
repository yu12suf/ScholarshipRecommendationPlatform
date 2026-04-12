
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', 'password123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function testV() {
  try {
    const vec = new Array(3072).fill(0.1);
    const vecStr = `[${vec.join(',')}]`;
    console.log('Inserting test vector...');
    await sequelize.query(`UPDATE scholarships SET embedding = '${vecStr}'::vector WHERE id = 1`);
    console.log('Reading back...');
    const [rows] = await sequelize.query('SELECT embedding FROM scholarships WHERE id = 1');
    console.log('Type received:', typeof rows[0].embedding);
    console.log('Is array?', Array.isArray(rows[0].embedding));
    console.log('Sample data:', rows[0].embedding.substring?.(0, 50) || rows[0].embedding.slice?.(0, 5));
  } catch (err) {
    console.log('TEST FAILED:', err.message);
  } finally {
    process.exit(0);
  }
}

testV();
