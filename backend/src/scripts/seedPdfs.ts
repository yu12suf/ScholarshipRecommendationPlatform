import { Pdf } from "../models/Pdf.js";
import { sequelize } from "../config/sequelize.js";

async function seed() {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");
        await sequelize.sync({ alter: true });

        const levels: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
        const types: ('Reading' | 'Listening' | 'Writing' | 'Speaking')[] = ['Reading', 'Listening', 'Writing', 'Speaking'];
        
        const pdfData: any = {
            'Reading': {
                'easy': 'Introduction to IELTS Reading.pdf',
                'medium': 'Advanced Skimming Techniques.pdf',
                'hard': 'Scientific Passages Mastery.pdf'
            },
            'Listening': {
                'easy': 'Listening for Keywords.pdf',
                'medium': 'Multiple Choice Strategies.pdf',
                'hard': 'Section 4 Academic Lectures.pdf'
            },
            'Speaking': {
                'easy': 'IELTS Speaking Part 1 Topics.pdf',
                'medium': 'Developing Part 2 Cue Cards.pdf',
                'hard': 'Abstract Discussion Mastery.pdf'
            },
            'Writing': {
                'easy': 'Basic Essay Structure.pdf',
                'medium': 'Cohesion and Coherence Guide.pdf',
                'hard': 'High Band Vocabulary for Task 2.pdf'
            }
        };

        console.log("Seeding educational PDFs for IELTS and TOEFL...");
        let count = 0;

        for (const examType of ['IELTS', 'TOEFL']) {
            for (const level of levels) {
                for (const type of types) {
                    const title = pdfData[type][level];
                    
                    for (let i = 1; i <= 5; i++) {
                        const finalTitle = i === 1 ? title : `${title.replace('.pdf', '')} - Part ${i}.pdf`;
                        const [pdf, created] = await Pdf.findOrCreate({
                            where: {
                                title: `${examType} - ${finalTitle}`,
                                type,
                                level,
                                examType: examType as any
                            },
                            defaults: {
                                pdfLink: `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`,
                            }
                        });
                        if (created) count++;
                    }
                }
            }
        }

        console.log(`✅ Seeded ${count} study guides.`);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding PDFs:", error);
        process.exit(1);
    }
}

seed();
