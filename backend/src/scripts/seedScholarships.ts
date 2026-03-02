import { ScholarshipSourceRepository } from "../repositories/ScholarshipSourceRepository.js";

export const seedScholarshipSources = async () => {
    const sources = [
        {
            
            baseUrl: "https://www.fastweb.com/college-scholarships",
            domainName: "Fastweb",
        },
            
        {
            baseUrl: "https://scholarships360.org/scholarships/",
            domainName: "Scholarships360",
        },
        
        {
            baseUrl: "https://bold.org/scholarships",
            domainName: "Bold",
        },
            
        {
          baseUrl: "https://www.scholars4dev.com/",
            domainName: "Scholars4dev",
        },
        {
            baseUrl: "https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en",
            domainName: "Erasmus Mundus",
        },
            
        {baseUrl: "https://www.scholars4dev.com/",
            domainName: "Scholars4dev",
        },
        {
            baseUrl: "https://cscuk.fcdo.gov.uk/scholarships",
            domainName: "cscuk.fcdo.gov.uk",
        },
        {
            baseUrl: "https://www.mastersportal.com/",
            domainName: "mastersportal.com",
        },


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
