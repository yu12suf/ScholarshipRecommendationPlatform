import { connectSequelize } from "../config/sequelize.js";
import { VisaGuideline } from "../models/index.js";

async function seedVisaGuidelines() {
    await connectSequelize();

    const guidelines = [
        {
            country: "USA",
            visaType: "F-1 Student Visa",
            requiredDocuments: ["I-20 Form", "DS-160 Confirmation", "SEVIS Fee Receipt", "Passport", "Financial Documents", "Academic Transcripts"],
            commonQuestions: [
                "Why did you choose this specific university in the US?",
                "Who is funding your education?",
                "What are your plans after completing your degree?",
                "Why can't you study this course in your home country?",
                "Do you have any relatives in the United States?"
            ]
        },
        {
            country: "UK",
            visaType: "Student Visa (Tier 4)",
            requiredDocuments: ["CAS (Confirmation of Acceptance for Studies)", "Passport", "Financial Proof", "ATAS Certificate (if applicable)", "TB Test Certificate (if applicable)"],
            commonQuestions: [
                "Why did you choose the UK for your studies?",
                "How will you fund your living expenses in the UK?",
                "What is your intended career path after this degree?",
                "Can you explain your previous study gaps (if any)?",
                "Where do you plan to stay in the UK?"
            ]
        },
        {
            country: "Canada",
            visaType: "Study Permit",
            requiredDocuments: ["Letter of Acceptance", "Provincial Attestation Letter (if applicable)", "Proof of Financial Support", "Passport", "Letter of Explanation"],
            commonQuestions: [
                "Why Canada and not your home country or the US?",
                "What ties do you have to your home country that will ensure your return?",
                "How did you gather the funds for your tuition?",
                "What are the core subjects in your program?",
                "Have you travelled internationally before?"
            ]
        },
        {
            country: "Australia",
            visaType: "Student Visa (Subclass 500)",
            requiredDocuments: ["CoE (Confirmation of Enrolment)", "OSHC (Overseas Student Health Cover)", "GTE Statement (Genuine Temporary Entrant)", "Passport", "Financial Evidence"],
            commonQuestions: [
                "How does this course relate to your previous studies?",
                "Why did you change your field of study? (if applicable)",
                "How do you plan to repay any education loans?",
                "What is the value of this Australian degree in your home country?",
                "Do you plan to work while studying?"
            ]
        }
    ];

    for (const item of guidelines) {
        const existing = await VisaGuideline.findOne({ where: { country: item.country } });
        if (!existing) {
            await VisaGuideline.create(item);
            console.log(`Seeded guidelines for ${item.country}`);
        } else {
            await existing.update(item);
            console.log(`Updated guidelines for ${item.country}`);
        }
    }

    console.log("Visa Guidelines seeded successfully!");
    process.exit(0);
}

seedVisaGuidelines().catch((err) => {
    console.error("Seeding failed", err);
    process.exit(1);
});
