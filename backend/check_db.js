
import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize('EAPS', 'postgres', 'password123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function checkCounselors() {
  try {
    const [allUsers] = await sequelize.query('SELECT id, name, email, role FROM users ORDER BY id');
    console.log('All Users:', allUsers);
    
    const [allCounselors] = await sequelize.query('SELECT c.id, c.user_id, c.verification_status, u.name as user_name, u.email as user_email FROM counselors c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.id');
    console.log('All Counselors with JOIN:', allCounselors);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

checkCounselors();
