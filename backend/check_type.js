
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function checkTypes() {
  try {
    const [rows] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'scholarships' AND column_name = 'embedding'");
    console.log('Scholarship embedding type:', rows[0].data_type);
    
    // Also check for 'USER-DEFINED' which is what 'vector' shows up as in information_schema
    const [extra] = await sequelize.query("SELECT pg_catalog.format_type(atttypid, atttypmod) FROM pg_attribute WHERE attrelid = 'scholarships'::regclass AND attname = 'embedding'");
    console.log('Real PG type:', extra[0].format_type);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkTypes();
