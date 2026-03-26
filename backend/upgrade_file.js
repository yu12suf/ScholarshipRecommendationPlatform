
import { Sequelize } from 'sequelize';
import fs from 'fs';
const sequelize = new Sequelize('EAP', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function run() {
  const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('result.log', msg + '\n');
  };
  
  try {
    if (fs.existsSync('result.log')) fs.unlinkSync('result.log');
    
    log('ALTERING scholarships...');
    await sequelize.query('ALTER TABLE scholarships ALTER COLUMN embedding TYPE vector(3072) USING (embedding::text::vector);');
    log('ALTERING students...');
    await sequelize.query('ALTER TABLE students ALTER COLUMN embedding TYPE vector(3072) USING (embedding::text::vector);');
    
    const [res] = await sequelize.query("SELECT pg_catalog.format_type(atttypid, atttypmod) FROM pg_attribute WHERE attrelid = 'scholarships'::regclass AND attname = 'embedding'");
    log('DONE. NEW_TYPE: ' + res[0].format_type);
  } catch (err) {
    log('ERROR: ' + err.message);
  } finally {
    process.exit(0);
  }
}

run();
