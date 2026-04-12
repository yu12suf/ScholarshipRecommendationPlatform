
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', 'password123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function listCols() {
  try {
    const [rows] = await sequelize.query("SELECT attname as name, format_type(atttypid, atttypmod) as type FROM pg_attribute WHERE attrelid = 'scholarships'::regclass AND attnum > 0");
    console.log('Columns for scholarships:');
    rows.forEach(r => console.log(`- ${r.name}: ${r.type}`));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

listCols();
