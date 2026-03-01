import { Scholarship } from "../models/Scholarship.js";
import { VectorService } from "../services/VectorService.js";

export const seedTestData = async () => {
    const testData = [
        {
            title: "Google STEM Scholarship",
            description: "Full funding for Computer Science and Software Engineering undergraduate students to study in the United States. Focuses on AI and technology.",
            degree_levels: ["Bachelor"],
            country: "USA",
            fundType: "Full Funding",
            originalUrl: "https://test.com/1"
        },
        {
            title: "USA Arts & Humanities Grant",
            description: "A grant for Bachelor students in the USA studying history, literature, or fine arts.",
            degree_levels: ["Bachelor"],
            country: "USA",
            fundType: "Partial Funding",
            originalUrl: "https://test.com/2"
        }
    ];

    for (const data of testData) {
        // 1. Generate the 3072 vector
        const vector = await VectorService.generateScholarshipEmbedding(data);
        
        // 2. Save with the bracketed string format
        await Scholarship.create({
            ...data,
            embedding: `[${vector.join(',')}]`
        });
    }
    console.log("Seed complete!");
}