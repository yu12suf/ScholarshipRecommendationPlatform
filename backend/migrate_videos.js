
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function migrate() {
  try {
    await sequelize.query("ALTER TABLE videos ADD COLUMN IF NOT EXISTS title character varying(255)");
    await sequelize.query("ALTER TABLE videos ADD COLUMN IF NOT EXISTS description text");
    console.log('Migration successful: title and description columns added to videos table.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
