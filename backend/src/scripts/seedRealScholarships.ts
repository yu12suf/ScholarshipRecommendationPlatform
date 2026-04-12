import { Scholarship } from "../models/Scholarship.js";
import { sequelize } from "../config/sequelize.js";

const realScholarships = [
    {
        title: "Fulbright Scholarship Program",
        description: "The Fulbright Program offers fellowships for study or research in the United States to international students.",
        degree_levels: ["Master", "PhD"],
        country: "USA",
        fundType: "Full Funding",
        requirements: "Bachelor's degree, English proficiency, academic excellence",
        originalUrl: "https://fulbright program.org/"
    },
    {
        title: "Chevening Scholarship",
        description: "Chevening offers unique awards to students with leadership potential who have a clear vision for their future.",
        degree_levels: ["Master"],
        country: "United Kingdom",
        fundType: "Full Funding",
        requirements: "Bachelor's degree, 2 years work experience, leadership potential",
        originalUrl: "https://www.chevening.org/"
    },
    {
        title: "Commonwealth Scholarship",
        description: "Commonwealth Scholarships are for students from developing Commonwealth countries to pursue master's or PhD.",
        degree_levels: ["Master", "PhD"],
        country: "United Kingdom",
        fundType: "Full Funding",
        requirements: "Citizenship in developing Commonwealth country, bachelor's degree",
        originalUrl: "https://www.thecommonwealth.org/scholarships/"
    },
    {
        title: "Eiffel Excellence Scholarship",
        description: "The Eiffel Excellence Scholarship covers all expenses for international students to study in France.",
        degree_levels: ["Master", "PhD"],
        country: "France",
        fundType: "Full Funding",
        requirements: "Bachelor's degree (Master), Master's degree (PhD), French or English proficiency",
        originalUrl: "https://www.campusfrance.org/en/eiffel-scholarship"
    },
    {
        title: "DAAD Scholarship",
        description: "DAAD offers various scholarships for international students to study in Germany.",
        degree_levels: ["Master", "PhD"],
        country: "Germany",
        fundType: "Full Funding",
        requirements: "Bachelor's degree, German proficiency for some programs",
        originalUrl: "https://www.daad.de/en/"
    },
    {
        title: "Swiss Government Excellence Scholarship",
        description: "Scholarships for international students to study at Swiss universities.",
        degree_levels: ["Master", "PhD"],
        country: "Switzerland",
        fundType: "Full Funding",
        requirements: "Bachelor's degree, academic excellence",
        originalUrl: "https://www.sbfi.admin.ch/sbfi/en/"
    },
    {
        title: "MEXT Scholarship",
        description: "Japanese Government Scholarship for international students at all degree levels.",
        degree_levels: ["Bachelor", "Master", "PhD"],
        country: "Japan",
        fundType: "Full Funding",
        requirements: "Bachelor's degree, academic ability, Japanese proficiency (some programs)",
        originalUrl: "https://www.mext.go.jp/en/"
    },
    {
        title: "Vanier Scholarship",
        description: "Vanier CGS supports top doctoral students in Canada.",
        degree_levels: ["PhD"],
        country: "Canada",
        fundType: "Full Funding",
        requirements: "PhD program, Canadian citizenship or permanent residency",
        originalUrl: "https://www.vaniercollege.ca/"
    },
    {
        title: "Rhodes Scholarship",
        description: "One of the oldest international scholarships for study at Oxford.",
        degree_levels: ["Master"],
        country: "United Kingdom",
        fundType: "Full Funding",
        requirements: "Bachelor's degree, age under 23",
        originalUrl: "https://www.rhodesscholar.org/"
    },
    {
        title: "Gates Cambridge Scholarship",
        description: "Full scholarship for international students to study at Cambridge.",
        degree_levels: ["Master", "PhD"],
        country: "United Kingdom",
        fundType: "Full Funding",
        requirements: "Bachelor's degree, leadership skills",
        originalUrl: "https://www.gatescambridge.org/"
    },
    {
        title: "Australia Awards Scholarship",
        description: "Scholarships for students from developing countries to study in Australia.",
        degree_levels: ["Master", "PhD"],
        country: "Australia",
        fundType: "Full Funding",
        requirements: "Citizenship in eligible country, bachelor's degree",
        originalUrl: "https://www.dfat.gov.au/"
    },
    {
        title: "Erasmus Mundus Scholarship",
        description: "EU scholarships for international students to study in Europe.",
        degree_levels: ["Master"],
        country: "Europe",
        fundType: "Full Funding",
        requirements: "Bachelor's degree, academic excellence",
        originalUrl: "https://www.european-student-card.eu/"
    },
    {
        title: "Knight-Hennessy Scholarship",
        description: "Full scholarship for graduate students at Stanford.",
        degree_levels: ["Master", "PhD"],
        country: "USA",
        fundType: "Full Funding",
        requirements: "Bachelor's degree, leadership potential",
        originalUrl: "https://knight-hennessy.stanford.edu/"
    },
    {
        title: "Yale World Fellows",
        description: "Fellowship for emerging leaders to study at Yale.",
        degree_levels: ["Master"],
        country: "USA",
        fundType: "Fellowship",
        requirements: "Work experience, leadership",
        originalUrl: "https://worldfellows.yale.edu/"
    },
    {
        title: "Hubble Scholarship",
        description: "Space science scholarship for international students.",
        degree_levels: ["Master", "PhD"],
        country: "USA",
        fundType: "Full Funding",
        requirements: "Bachelor's in STEM, academic excellence",
        originalUrl: "https://www.stsci.edu/"
    }
];

async function updateScholarships() {
    await sequelize.authenticate();
    console.log('Connected to DB');

    for (const data of realScholarships) {
        try {
            await Scholarship.create({
                ...data,
                deadline: new Date("2026-12-31")
            });
            console.log(`Created: ${data.title}`);
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                console.log(`Already exists: ${data.title}`);
            } else {
                console.error(`Error creating ${data.title}:`, err.message);
            }
        }
    }

    const count = await Scholarship.count();
    console.log(`\nTotal scholarships in DB: ${count}`);
    process.exit(0);
}

updateScholarships();