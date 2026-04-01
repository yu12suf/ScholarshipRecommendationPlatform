
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function forceUpgrade() {
  const transaction = await sequelize.transaction();
  try {
    console.log('Beginning transformation...');
    
    // 1. Create extension
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;', { transaction });
    
    // 2. Perform alteration
    await sequelize.query('ALTER TABLE scholarships ALTER COLUMN embedding TYPE vector(3072) USING (embedding::text::vector);', { transaction });
    
    await transaction.commit();
    console.log('COMMIT SUCCESS');
  } catch (err) {
    await transaction.rollback();
    console.error('FATAL ERROR:', err.message);
  } finally {
    process.exit(0);
  }
}

forceUpgrade();
