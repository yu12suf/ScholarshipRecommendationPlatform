
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function tryEnable() {
  try {
    await sequelize.query('CREATE EXTENSION vector;');
    console.log('SUCCESS: pgvector extension created.');
  } catch (err) {
    console.error('FAILURE:', err.message);
  } finally {
    process.exit(0);
  }
}

tryEnable();
