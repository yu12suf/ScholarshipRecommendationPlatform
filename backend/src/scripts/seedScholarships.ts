import { ScholarshipSourceRepository } from "../repositories/ScholarshipSourceRepository.js";

export const seedScholarshipSources = async () => {
   const sources = [
    {
        baseUrl: "https://opportunitiesforafricans.com/",
        domainName: "Opportunities For Africans"
    },
    {
        baseUrl: "https://www.afterschoolafrica.com/",
        domainName: "After School Africa"
    },
    {
        baseUrl: "https://www.scholarshiptab.com/",
        domainName: "ScholarshipTab"
    },
    {
        baseUrl: "https://scholarship-positions.com/",
        domainName: "Scholarship Positions"
    },
    {
        baseUrl: "https://www.scholarshipregion.com/",
        domainName: "Scholarship Region"
    },
    {
        baseUrl: "https://globalscholarships.com/",
        domainName: "Global Scholarships"
    },
    {
        baseUrl: "https://www.profellow.com/",
        domainName: "ProFellow"
    },
    {
        baseUrl: "https://opportunitydesk.org/",
        domainName: "Opportunity Desk"
    },
    {
        baseUrl: "https://www.internationalscholarships.com/",
        domainName: "International Scholarships"
    },
    {
        baseUrl: "https://www.scholars4dev.com/",
        domainName: "Scholars4Dev"
    },
    {
        baseUrl: "https://www.iefa.org/scholarships",
        domainName: "IEFA"
    },
    {
        baseUrl: "https://www.educations.com/scholarships/",
        domainName: "Educations Scholarships"
    },
    {
        baseUrl: "https://www.mastersportal.com/scholarships/",
        domainName: "Masters Portal Scholarships"
    },
    {
        baseUrl: "https://www.phdportal.com/scholarships/",
        domainName: "PhD Portal Scholarships"
    },
    {
        baseUrl: "https://www.bachelorsportal.com/scholarships/",
        domainName: "Bachelors Portal Scholarships"
    }
];

    console.log("Seeding scholarship sources...");

    for (const source of sources) {
        const [record, created] = await ScholarshipSourceRepository.findOrCreate({
            baseUrl: source.baseUrl,
            domainName: source.domainName,
            isActive: true
        });

        if (created) {
            console.log(`Added source: ${source.domainName}`);
        } else {
            console.log(`Source already exists: ${source.domainName}`);
        }
    }
    console.log("Scholarship sources seeding completed.");
};
