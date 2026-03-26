
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function run() {
  try {
    const q = 'ALTER TABLE scholarships ALTER COLUMN embedding TYPE vector(3072) USING (embedding::text::vector);';
    console.log('ALTERING...');
    await sequelize.query(q);
    console.log('ALTER_DONE');
    
    // Check type immediately after
    const [res] = await sequelize.query("SELECT pg_catalog.format_type(atttypid, atttypmod) FROM pg_attribute WHERE attrelid = 'scholarships'::regclass AND attname = 'embedding'");
    console.log('NEW_TYPE:', res[0].format_type);
  } catch (err) {
    console.log('ERROR:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
