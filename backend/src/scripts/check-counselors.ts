
import { sequelize } from '../config/sequelize.js';
import { Counselor, User } from '../models/index.js';

async function checkCounselors() {
    try {
        await sequelize.authenticate();
        const counselors = await Counselor.findAll({
            include: [{ model: User, as: 'user' }]
        });
        console.log(`Found ${counselors.length} counselors:`);
        counselors.forEach(c => {
            console.log(`- ID: ${c.id}, UserID: ${c.userId}, Name: ${c.user?.name}, Status: ${c.verificationStatus}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkCounselors();
