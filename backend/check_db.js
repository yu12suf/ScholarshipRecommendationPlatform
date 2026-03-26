
import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize('EAP', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function checkScores() {
  try {
    const [scholarships] = await sequelize.query('SELECT id, title, country, degree_levels FROM scholarships LIMIT 5');
    console.log('Sample Scholarships:', scholarships);
    
    const [students] = await sequelize.query('SELECT user_id, country_interest, degree_seeking, field_of_study, calculated_gpa FROM students LIMIT 5');
    console.log('Sample Students:', students);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

checkScores();
