import { Scholarship } from "../models/Scholarship.js";
import { sequelize } from "../config/sequelize.js";

async function checkScholarships() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');
        
        const count = await Scholarship.count();
        console.log('Scholarship count:', count);
        
        if (count > 0) {
            const scholarships = await Scholarship.findAll({ limit: 3 });
            console.log('Sample scholarships:');
            for (const s of scholarships) {
                console.log('-', s.title, s.country, s.degreeLevels);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

checkScholarships();