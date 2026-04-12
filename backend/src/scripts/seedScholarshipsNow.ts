import { Scholarship } from "../models/Scholarship.js";
import { sequelize } from "../config/sequelize.js";
import { VectorService } from "../services/VectorService.js";

async function seedScholarships() {
    await sequelize.authenticate();
    console.log('Connected to DB');

    const testData = [
        {
            title: "Google STEM Scholarship for African Students",
            description: "Full funding for Computer Science and Software Engineering undergraduate students from Africa to study in the USA. Focuses on AI and technology innovation.",
            degree_levels: JSON.stringify(["Bachelor"]),
            country: "USA",
            fundType: "Full Funding",
            requirements: "Minimum 3.5 GPA, African citizenship",
            deadline: new Date("2025-12-31"),
            originalUrl: "https://example.com/scholarship1"
        },
        {
            title: "USA Arts & Humanities Undergraduate Grant",
            description: "A grant for Bachelor students in the USA studying history, literature, or fine arts. Open to international students.",
            degree_levels: JSON.stringify(["Bachelor"]),
            country: "USA",
            fundType: "Partial Funding",
            requirements: "Demonstrated interest in arts",
            deadline: new Date("2025-06-30"),
            originalUrl: "https://example.com/scholarship2"
        },
        {
            title: "UK Master of Computer Science Scholarship",
            description: "Full scholarship for master's program in Computer Science at UK universities. Focus on AI and machine learning.",
            degree_levels: JSON.stringify(["Master"]),
            country: "UK",
            fundType: "Full Funding",
            requirements: "Bachelor's degree in CS or related field",
            deadline: new Date("2025-08-15"),
            originalUrl: "https://example.com/scholarship3"
        },
        {
            title: "Canada Global Student Scholarship",
            description: "Funding for international students pursuing undergraduate studies in Canada. All fields of study welcome.",
            degree_levels: JSON.stringify(["Bachelor", "Master"]),
            country: "Canada",
            fundType: "Partial Funding",
            requirements: "Academic excellence",
            deadline: new Date("2025-05-01"),
            originalUrl: "https://example.com/scholarship4"
        },
        {
            title: "Australia International Research Fellowship",
            description: "PhD scholarship for international students to conduct research in Australia. All disciplines welcome.",
            degree_levels: JSON.stringify(["PhD"]),
            country: "Australia",
            fundType: "Full Funding",
            requirements: "Research proposal required",
            deadline: new Date("2025-10-31"),
            originalUrl: "https://example.com/scholarship5"
        }
    ];

    for (const data of testData) {
        try {
            const vector = await VectorService.generateScholarshipEmbedding({
                title: data.title,
                description: data.description
            });
            
            await Scholarship.create({
                ...data,
                embedding: `[${vector.join(',')}]`
            });
            console.log(`Created: ${data.title}`);
        } catch (error) {
            console.error(`Error creating ${data.title}:`, error.message);
        }
    }

    const count = await Scholarship.count();
    console.log(`\nTotal scholarships: ${count}`);
    
    await sequelize.close();
    process.exit(0);
}

seedScholarships().catch(console.error);