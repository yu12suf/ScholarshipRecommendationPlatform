import { Student } from "../models/Student.js";
import { sequelize } from "../config/sequelize.js";

async function updateStudent() {
    await sequelize.authenticate();
    
    const student = await Student.findOne({ where: { userId: 1 } });
    if (student) {
        await student.update({
            isOnboarded: true,
            countryInterest: 'USA',
            degreeSeeking: 'Bachelor',
            fieldOfStudy: 'Computer Science',
            preferredDegreeLevel: JSON.stringify(['Bachelor'])
        });
        console.log('Student updated to onboarded');
    } else {
        console.log('No student record found');
    }
    
    await sequelize.close();
    process.exit(0);
}

updateStudent().catch(console.error);