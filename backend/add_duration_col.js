
import { Sequelize } from 'sequelize';
import configs from './dist/config/configs.js';

const sequelize = new Sequelize(configs.DB_NAME, configs.DB_USER, configs.DB_PASSWORD, {
  host: configs.DB_HOST,
  port: configs.DB_PORT,
  dialect: 'postgres',
  logging: false
});

async function run() {
  try {
    console.log('Adding duration column to videos table...');
    // Add column if it doesn't exist
    await sequelize.query('ALTER TABLE videos ADD COLUMN IF NOT EXISTS duration VARCHAR(20) DEFAULT \'10:00 mins\';');
    console.log('Success!');
  } catch (err) {
    console.log('Error adding column:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
