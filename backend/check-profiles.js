
import { Counselor } from './src/models/Counselor.js';
import { Student } from './src/models/Student.js';
import { sequelize } from './src/config/sequelize.js';

async function checkProfiles() {
    try {
        const counselors = await Counselor.findAll();
        const students = await Student.findAll();
        console.log('Counselors:', JSON.stringify(counselors, null, 2));
        console.log('Students:', JSON.stringify(students, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkProfiles();
