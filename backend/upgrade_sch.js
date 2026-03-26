
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function upgradeScholarships() {
  try {
    console.log('Starting ALER TABLE scholarships...');
    await sequelize.query('ALTER TABLE scholarships ALTER COLUMN embedding TYPE vector(3072) USING (embedding::text::vector);');
    console.log('SCHOLARSHIPS_UPGRADE_COMPLETE');
  } catch (err) {
    console.error('SCHOLARSHIPS_UPGRADE_FAILED:', err.message);
  } finally {
    process.exit(0);
  }
}

upgradeScholarships();
