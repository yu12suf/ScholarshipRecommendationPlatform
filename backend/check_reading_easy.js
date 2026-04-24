
import { Sequelize } from 'sequelize';
import configs from './dist/config/configs.js';

const sequelize = new Sequelize(configs.DB_NAME, configs.DB_USER, configs.DB_PASSWORD, {
  host: configs.DB_HOST,
  port: configs.DB_PORT,
  dialect: 'postgres',
  logging: false
});

async function checkReading() {
  try {
    const [rows] = await sequelize.query("SELECT id, video_link, title FROM videos WHERE type = 'Reading' AND level = 'easy' AND exam_type = 'IELTS' ORDER BY id ASC");
    console.log('Reading Easy Videos:');
    rows.forEach(r => console.log(`ID: ${r.id}, Title: ${r.title}, Link: ${r.video_link}`));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkReading();
