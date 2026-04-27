import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'edupathway',
  dialect: 'postgres',
  logging: false
});

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'users', timestamps: false });

const Student = sequelize.define('Student', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'students', timestamps: false });

const CounselorReview = sequelize.define('CounselorReview', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'counselor_reviews', timestamps: false });

async function run() {
  try {
    await sequelize.authenticate();
    const reviews = await CounselorReview.findAll({ limit: 5 });
    
    for (const review of reviews) {
        console.log(`Review ${review.id} -> student_id: ${review.student_id}`);
        const student = await Student.findByPk(review.student_id);
        if (student) {
             console.log(`   Found Student ${student.id} -> user_id: ${student.user_id}`);
             const user = await User.findByPk(student.user_id);
             if (user) {
                 console.log(`   Found User ${user.id} -> name: ${user.name}`);
             } else {
                 console.log("   User not found");
             }
        } else {
             console.log("   Student not found");
        }
    }
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
}

run();
