import { ScholarshipSourceRepository } from "../repositories/ScholarshipSourceRepository.js";

export const seedScholarshipSources = async () => {
  const sources = [
    // --- YOUR ORIGINAL SOURCES ---
    {
      baseUrl: "https://opportunitiesforafricans.com/",
      domainName: "Opportunities For Africans",
    },
    {
      baseUrl: "https://www.afterschoolafrica.com/",
      domainName: "After School Africa",
    },
    {
      baseUrl: "https://www.scholarshiptab.com/",
      domainName: "ScholarshipTab",
    },
    {
      baseUrl: "https://scholarship-positions.com/",
      domainName: "Scholarship Positions",
    },
    {
      baseUrl: "https://www.scholarshipregion.com/",
      domainName: "Scholarship Region",
    },
    {
      baseUrl: "https://globalscholarships.com/",
      domainName: "Global Scholarships",
    },
    { baseUrl: "https://www.profellow.com/", domainName: "ProFellow" },
    { baseUrl: "https://opportunitydesk.org/", domainName: "Opportunity Desk" },
    {
      baseUrl: "https://www.internationalscholarships.com/",
      domainName: "International Scholarships",
    },
    { baseUrl: "https://www.scholars4dev.com/", domainName: "Scholars4Dev" },
    { baseUrl: "https://www.iefa.org/scholarships", domainName: "IEFA" },
    {
      baseUrl: "https://www.educations.com/scholarships/",
      domainName: "Educations Scholarships",
    },
    {
      baseUrl: "https://www.mastersportal.com/scholarships/",
      domainName: "Masters Portal Scholarships",
    },
    {
      baseUrl: "https://www.phdportal.com/scholarships/",
      domainName: "PhD Portal Scholarships",
    },
    {
      baseUrl: "https://www.bachelorsportal.com/scholarships/",
      domainName: "Bachelors Portal Scholarships",
    },

    // --- GLOBAL AGGREGATORS & SEARCH ENGINES ---
    { baseUrl: "https://www.fastweb.com/", domainName: "Fastweb" },
    {
      baseUrl: "https://www.scholarships.com/",
      domainName: "Scholarships.com",
    },
    { baseUrl: "https://www.cappex.com/", domainName: "Cappex" },
    {
      baseUrl: "https://www.niche.com/colleges/scholarships/",
      domainName: "Niche Scholarships",
    },
    { baseUrl: "https://www.unigo.com/", domainName: "Unigo" },
    {
      baseUrl: "https://www.petersons.com/scholarship-search.aspx",
      domainName: "Petersons",
    },
    {
      baseUrl: "https://www.chegg.com/scholarships",
      domainName: "Chegg Scholarships",
    },
    { baseUrl: "https://www.bold.org/", domainName: "Bold.org" },
    { baseUrl: "https://www.goingmerry.com/", domainName: "Going Merry" },
    {
      baseUrl: "https://www.scholarshipowl.com/",
      domainName: "ScholarshipOwl",
    },
    { baseUrl: "https://www.collegexpress.com/", domainName: "CollegeExpress" },
    {
      baseUrl: "https://www.salliemae.com/college-planning/scholarship-search/",
      domainName: "Sallie Mae",
    },
    {
      baseUrl: "https://www.scholarshipmonkey.com/",
      domainName: "ScholarshipMonkey",
    },
    { baseUrl: "https://www.brokescholar.com/", domainName: "BrokeScholar" },
    {
      baseUrl:
        "https://www.careeronestop.org/Toolkit/Training/find-scholarships.aspx",
      domainName: "CareerOneStop (US Dept of Labor)",
    },
    {
      baseUrl: "https://www.collegeboard.org/",
      domainName: "College Board BigFuture",
    },
    {
      baseUrl: "https://www.accessscholarships.com/",
      domainName: "Access Scholarships",
    },
    {
      baseUrl: "https://www.scholarships360.org/",
      domainName: "Scholarships360",
    },
    {
      baseUrl: "https://www.jlvcollegecounseling.com/",
      domainName: "JLV College Counseling",
    },

    // --- EUROPE & UK PORTALS ---
    {
      baseUrl:
        "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
      domainName: "DAAD Germany",
    },
    {
      baseUrl:
        "https://www.britishcouncil.org/study-work-abroad/outside-uk/scholarships",
      domainName: "British Council",
    },
    {
      baseUrl: "https://study-uk.britishcouncil.org/scholarships-funding",
      domainName: "Study UK",
    },
    { baseUrl: "https://www.chevening.org/", domainName: "Chevening Awards" },
    { baseUrl: "https://www.erasmusmundus.it/", domainName: "Erasmus Mundus" },
    {
      baseUrl: "https://www.campusfrance.org/en/bourses-etudiants-etrangers",
      domainName: "Campus France",
    },
    {
      baseUrl: "https://www.studyinholland.nl/finances/scholarships",
      domainName: "Study in Holland",
    },
    {
      baseUrl: "https://www.studyinsweden.se/scholarships",
      domainName: "Study in Sweden",
    },
    {
      baseUrl: "https://www.studyinaustria.at/en/study/scholarships",
      domainName: "Study in Austria",
    },
    {
      baseUrl: "https://www.educationsuisse.ch/",
      domainName: "Education Suisse",
    },
    {
      baseUrl: "https://www.studyinbelgium.be/en/scholarships",
      domainName: "Study in Belgium",
    },
    { baseUrl: "https://www.euraxess.es/", domainName: "Euraxess Spain" },
    {
      baseUrl: "https://www.studyinfinland.fi/scholarships",
      domainName: "Study in Finland",
    },
    {
      baseUrl: "https://www.studyinnorway.no/study-in-norway/scholarships",
      domainName: "Study in Norway",
    },
    {
      baseUrl:
        "https://www.studyindenmark.dk/study-options/tuition-fees-scholarships",
      domainName: "Study in Denmark",
    },
    {
      baseUrl: "https://www.postgrad.com/fees_and_funding/scholarships/",
      domainName: "Postgrad.com",
    },
    {
      baseUrl: "https://www.findamasters.com/funding/",
      domainName: "FindAMasters",
    },
    { baseUrl: "https://www.findaphd.com/funding/", domainName: "FindAPhD" },

    // --- NORTH AMERICA (USA/CANADA) PORTALS ---
    {
      baseUrl:
        "https://www.canada.ca/en/services/benefits/education/scholarships.html",
      domainName: "Government of Canada Scholarships",
    },
    {
      baseUrl: "https://www.univcan.ca/programs-and-scholarships/",
      domainName: "Universities Canada",
    },
    {
      baseUrl: "https://www.scholarshipscanada.com/",
      domainName: "Scholarships Canada",
    },
    { baseUrl: "https://www.yconic.com/", domainName: "Yconic" },
    {
      baseUrl: "https://www.cicsnews.com/category/scholarships",
      domainName: "Canada Immigration News Scholarships",
    },
    {
      baseUrl: "https://www.edupass.org/financial-aid/scholarships/",
      domainName: "EduPass",
    },
    {
      baseUrl: "https://www.fulbrightprogram.org/",
      domainName: "Fulbright Program",
    },
    {
      baseUrl: "https://www.iie.org/",
      domainName: "Institute of International Education",
    },
    {
      baseUrl: "https://www.amideast.org/our-work/exchange-programs",
      domainName: "Amideast",
    },
    {
      baseUrl: "https://www.hacu.net/hacu/Scholarships.asp",
      domainName: "HACU (Hispanic Association)",
    },
    {
      baseUrl: "https://www.uncf.org/scholarships",
      domainName: "UNCF (United Negro College Fund)",
    },
    { baseUrl: "https://www.apiascholars.org/", domainName: "APIA Scholars" },
    {
      baseUrl: "https://www.aauw.org/resources/programs/fellowships-grants/",
      domainName: "AAUW (Women/Girls)",
    },
    {
      baseUrl: "https://www.jackierobinson.org/scholarship/",
      domainName: "Jackie Robinson Foundation",
    },

    // --- ASIA, OCEANIA & MIDDLE EAST ---
    {
      baseUrl:
        "https://www.studyinaustralia.gov.au/english/australian-education/scholarships",
      domainName: "Study in Australia",
    },
    {
      baseUrl: "https://www.australiaawards.gov.au/",
      domainName: "Australia Awards",
    },
    {
      baseUrl: "https://www.enz.govt.nz/support/funding/scholarships/",
      domainName: "Education New Zealand",
    },
    {
      baseUrl:
        "https://www.mext.go.jp/en/policy/education/highered/title02/special02/smapstop.htm",
      domainName: "MEXT Japan",
    },
    {
      baseUrl: "https://www.studyinkorea.go.kr/en/sub/gks/all_scholarships.do",
      domainName: "Global Korea Scholarship",
    },
    {
      baseUrl: "https://www.csc.edu.cn/studyinchina/",
      domainName: "China Scholarship Council",
    },
    {
      baseUrl: "https://www.straitstimes.com/tags/scholarships",
      domainName: "Straits Times Scholarships (Singapore)",
    },
    {
      baseUrl: "https://www.moe.gov.sg/financial-matters/awards-scholarships",
      domainName: "MOE Singapore",
    },
    {
      baseUrl: "https://www.twas.org/opportunities",
      domainName: "TWAS (Developing World)",
    },
    {
      baseUrl: "https://www.isdb.org/scholarships",
      domainName: "Islamic Development Bank",
    },
    {
      baseUrl: "https://www.kaust.edu.sa/en/study/fellowship",
      domainName: "KAUST Fellowship",
    },

    // --- INTERNATIONAL ORGANIZATIONS & NGOS ---
    {
      baseUrl: "https://www.worldbank.org/en/programs/scholarships",
      domainName: "World Bank Scholarships",
    },
    {
      baseUrl: "https://www.unesco.org/en/fellowships",
      domainName: "UNESCO Fellowships",
    },
    {
      baseUrl: "https://www.rotary.org/en/our-programs/scholarships",
      domainName: "Rotary International",
    },
    {
      baseUrl: "https://www.fordfoundation.org/work/our-grants/",
      domainName: "Ford Foundation",
    },
    {
      baseUrl: "https://www.gatesfoundation.org/about/careers/scholarships",
      domainName: "Gates Foundation",
    },
    {
      baseUrl: "https://www.gatescambridge.org/",
      domainName: "Gates Cambridge",
    },
    {
      baseUrl:
        "https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/",
      domainName: "Rhodes Trust",
    },
    {
      baseUrl:
        "https://www.mastercardfdn.org/projects/the-mastercard-foundation-scholars-program/",
      domainName: "Mastercard Foundation",
    },
    {
      baseUrl: "https://www.opensocietyfoundations.org/grants",
      domainName: "Open Society Foundations",
    },
    {
      baseUrl:
        "https://www.akdn.org/our-agencies/aga-khan-foundation/international-scholarship-programme",
      domainName: "Aga Khan Foundation",
    },

    // --- SPECIALIZED & NICHE ---
    {
      baseUrl: "https://www.computer.org/scholarships",
      domainName: "IEEE Computer Society",
    },
    {
      baseUrl: "https://www.swe.org/scholarships",
      domainName: "Society of Women Engineers",
    },
    {
      baseUrl: "https://www.nsbe.org/scholarships",
      domainName: "National Society of Black Engineers",
    },
    {
      baseUrl: "https://www.shpe.org/students/scholarships",
      domainName: "SHPE (Hispanic Engineers)",
    },
    {
      baseUrl: "https://www.outtoswm.org/scholarships",
      domainName: "Out to Innovate (LGBTQ+ STEM)",
    },
    {
      baseUrl: "https://www.pointfoundation.org/",
      domainName: "Point Foundation",
    },
    {
      baseUrl: "https://www.thebeamanfoundation.com/",
      domainName: "Beaman Foundation",
    },
    {
      baseUrl: "https://www.wemakescholars.com/",
      domainName: "WeMakeScholars",
    },
    {
      baseUrl: "https://www.scholarshipsads.com/",
      domainName: "ScholarshipAds",
    },
    {
      baseUrl: "https://www.indixital.com/",
      domainName: "Indixital Scholarships",
    },
    {
      baseUrl: "https://www.bestschools.com/scholarships/",
      domainName: "Best Schools",
    },
    {
      baseUrl:
        "https://www.topuniversities.com/student-info/scholarship-advice",
      domainName: "QS TopUniversities",
    },
    {
      baseUrl:
        "https://www.timeshighereducation.com/student/advice/scholarships",
      domainName: "THE Student",
    },
    {
      baseUrl: "https://www.moneygeek.com/financial-search/scholarships/",
      domainName: "MoneyGeek Scholarships",
    },
    {
      baseUrl: "https://www.goodcall.com/scholarships/",
      domainName: "GoodCall",
    },
    {
      baseUrl: "https://www.discover.com/student-loans/scholarships/search",
      domainName: "Discover Scholarships",
    },
    { baseUrl: "https://www.finaid.org/scholarships/", domainName: "FinAid" },
    {
      baseUrl: "https://www.internationalscholarships.ca/",
      domainName: "International Scholarships Canada",
    },
    {
      baseUrl: "https://www.scholarshipdesk.com/",
      domainName: "Scholarship Desk",
    },
    { baseUrl: "https://www.youthop.com/", domainName: "Youth Opportunities" },
    {
      baseUrl: "https://www.opportunitiescircle.com/",
      domainName: "Opportunities Circle",
    },
    {
      baseUrl: "https://www.opportunitiesforyouth.org/",
      domainName: "Opportunities For Youth",
    },
    {
      baseUrl: "https://www.oecd.org/careers/internships-scholarships.htm",
      domainName: "OECD",
    },
    {
      baseUrl: "https://www.commonwealthscholarships.org/",
      domainName: "Commonwealth Scholarships",
    },
    { baseUrl: "https://www.daad.org.in/", domainName: "DAAD India" },
    {
      baseUrl: "https://www.france-education-international.fr/",
      domainName: "France Education International",
    },
    { baseUrl: "https://www.campus-austria.at/", domainName: "Campus Austria" },
    {
      baseUrl: "https://www.viva-mundo.com/en/scholarships",
      domainName: "Viva Mundo",
    },
  ];

  console.log(`Seeding ${sources.length} scholarship sources...`);

  for (const source of sources) {
    try {
      const [record, created] = await ScholarshipSourceRepository.findOrCreate({
        baseUrl: source.baseUrl,
        domainName: source.domainName,
        isActive: true,
      });

      if (created) {
        console.log(`Added: ${source.domainName}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error seeding ${source.domainName}:`, errorMessage);
    }
  }
  console.log("Scholarship sources seeding completed.");
};
