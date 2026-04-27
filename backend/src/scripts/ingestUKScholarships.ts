import { Scholarship } from "../models/Scholarship.js";
import { VectorService } from "../services/VectorService.js";
import { sequelize } from "../config/sequelize.js";
import crypto from "crypto";

const scholarshipsToIngest = [
    {
        title: "University of Bristol - Think Big Undergraduate Scholarships",
        description: "Massive tech and software ecosystem scholarship for international students. Heavily merit-based, perfect for applicants with software experience.",
        amount: "£6,500 - £13,000 per year",
        deadline: "2026-02-28",
        fundType: "Partial Funding",
        requirements: "International student applying for full-time undergraduate degree. Software/CS eligible.",
        country: "United Kingdom",
        originalUrl: "https://www.bristol.ac.uk/students/support/finances/scholarships/think-big-undergraduate/",
        degreeLevels: ["Bachelor"]
    },
    {
        title: "UCL Global Undergraduate Scholarship",
        description: "UCL's premier scholarship for exceptional international students. Covers both tuition and living allowances for undergraduates in top departments like CS.",
        amount: "Full tuition + Maintenance allowance",
        deadline: "2026-04-30",
        fundType: "Full Funding",
        requirements: "Exceptional academic background and demonstrated financial need. Software/CS eligible.",
        country: "United Kingdom",
        originalUrl: "https://www.ucl.ac.uk/scholarships/ucl-global-undergraduate-scholarship",
        degreeLevels: ["Bachelor"]
    },
    {
        title: "Amazon Future Engineer Bursary (UK)",
        description: "Corporate-sponsored bursary specifically for UK undergraduates studying computer science. Includes mentoring from Amazon engineers.",
        amount: "£5,000 per year",
        deadline: "2026-05-15",
        fundType: "Stipend",
        requirements: "Studying Computer Science or Software Engineering. Low household income threshold. UK resident/right to study.",
        country: "United Kingdom",
        originalUrl: "https://www.raeng.org.uk/programmes-and-prizes/programmes/uk-programmes/amazon-future-engineer-bursaries",
        degreeLevels: ["Bachelor"]
    },
    {
        title: "Sheffield Hallam University - Transform Together Scholarships",
        description: "Practical, industry-focused scholarship looking for ambassadors. Ideal for students whose work experience outshines their academic grades.",
        amount: "50% tuition fee waiver",
        deadline: "2026-05-31",
        fundType: "Partial Funding",
        requirements: "International/EU students. Looking for leaders and ambassadors with industry tech experience.",
        country: "United Kingdom",
        originalUrl: "https://www.shu.ac.uk/international/fees-scholarships-and-discounts/scholarships-discounts-and-bursaries/transform-together-scholarships",
        degreeLevels: ["Bachelor"]
    },
    {
        title: "University of Manchester - Global Futures Scholarship",
        description: "Academic merit scholarship in the 'Silicon Northern Quarter' tech hub. Specific undergraduate awards for international STEM students.",
        amount: "£5,000 - £10,000",
        deadline: "2026-06-30",
        fundType: "Partial Funding",
        requirements: "Based on academic merit. International STEM/Software students eligible.",
        country: "United Kingdom",
        originalUrl: "https://www.manchester.ac.uk/study/international/finance-and-scholarships/funding/",
        degreeLevels: ["Bachelor"]
    }
];

async function ingest() {
    try {
        await sequelize.authenticate();
        console.log("Connected to database for ingestion.");

        for (const data of scholarshipsToIngest) {
            console.log(`Processing: ${data.title}...`);
            
            // 1. Generate Embedding using the new aligned structure
            const embedding = await VectorService.generateScholarshipEmbedding(data);
            
            // 2. Generate content hash
            const contentHash = crypto.createHash("md5").update(data.description).digest("hex");

            // 3. Upsert into DB
            await Scholarship.upsert({
                ...data,
                embedding: embedding,
                contentHash: contentHash,
                deadline: new Date(data.deadline)
            });

            console.log(`✅ Ingested: ${data.title}`);
        }

        console.log("All scholarships ingested successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Ingestion failed:", error);
        process.exit(1);
    }
}

ingest();
