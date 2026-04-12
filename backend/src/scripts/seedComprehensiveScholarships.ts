import { Scholarship } from "../models/Scholarship.js";
import { sequelize } from "../config/sequelize.js";

const scholarships = [
    // USA
    { title: "Fulbright Foreign Student Program", description: "Full scholarship for international students to study in the USA", degree_levels: ["Master", "PhD"], country: "USA", fundType: "Full Funding", requirements: "Bachelor's degree, English proficiency", originalUrl: "https://fulbright.fulbrightprogram.org/" },
    { title: "Hubble Fellowship Program", description: "NASA Hubble Space Telescope research fellowship for astrophysics students", degree_levels: ["PhD"], country: "USA", fundType: "Full Funding", requirements: "PhD in astrophysics or related field", originalUrl: "https://www.stsci.edu/" },
    { title: "Knight-Hennessy Scholarship", description: "Full funding for graduate students at Stanford University", degree_levels: ["Master", "PhD"], country: "USA", fundType: "Full Funding", requirements: "Bachelor's degree, leadership potential", originalUrl: "https://knight-hennessy.stanford.edu/" },
    { title: "Yale World Fellows", description: "Executive leadership fellowship at Yale", degree_levels: ["Master"], country: "USA", fundType: "Fellowship", requirements: "Work experience, leadership", originalUrl: "https://worldfellows.yale.edu/" },
    { title: "Pickering Fellowship", description: "Foreign service scholarship for underrepresented groups", degree_levels: ["Master"], country: "USA", fundType: "Full Funding", requirements: "U.S. citizen, academic excellence", originalUrl: "https://www.tomdispatch.com/" },
    { title: "Critical Language Scholarship", description: "Language study abroad scholarship", degree_levels: ["Bachelor", "Master"], country: "USA", fundType: "Full Funding", requirements: "U.S. citizen, college student", originalUrl: "https://clscholarship.org/" },
    { title: "Boren Scholarship", description: "Study abroad for STEM and language programs", degree_levels: ["Bachelor"], country: "USA", fundType: "Full Funding", requirements: "U.S. citizen, study abroad", originalUrl: "https://www.borenawards.com/" },
    { title: "AIEF Scholarship", description: "Army Emergency Relief scholarship", degree_levels: ["Bachelor", "Master"], country: "USA", fundType: "Scholarship", requirements: "U.S. Army dependent", originalUrl: "https://www.aerhq.org/" },

    // UK
    { title: "Chevening Scholarship", description: "UK government scholarship for global leaders", degree_levels: ["Master"], country: "United Kingdom", fundType: "Full Funding", requirements: "Bachelor's degree, 2 years work experience", originalUrl: "https://www.chevening.org/" },
    { title: "Rhodes Scholarship", description: "World's oldest international scholarship at Oxford", degree_levels: ["Master"], country: "United Kingdom", fundType: "Full Funding", requirements: "Bachelor's degree, under 23 years old", originalUrl: "https://www.rhodesscholar.org/" },
    { title: "Gates Cambridge Scholarship", description: "Full scholarship for graduate study at Cambridge", degree_levels: ["Master", "PhD"], country: "United Kingdom", fundType: "Full Funding", requirements: "Bachelor's degree, leadership skills", originalUrl: "https://www.gatescambridge.org/" },
    { title: "Commonwealth Scholarship", description: "For students from Commonwealth countries", degree_levels: ["Master", "PhD"], country: "United Kingdom", fundType: "Full Funding", requirements: "Citizenship in Commonwealth country", originalUrl: "https://www.dfid.gov.uk/" },
    { title: "Marshall Scholarship", description: "American students to study in UK", degree_levels: ["Master"], country: "United Kingdom", fundType: "Full Funding", requirements: "U.S. citizen, bachelor's degree", originalUrl: "https://www.marshallscholarship.org/" },
    { title: "Churchill Scholarship", description: "STEM students to study at Cambridge", degree_levels: ["Master"], country: "United Kingdom", fundType: "Full Funding", requirements: "U.S. citizen, STEM field", originalUrl: "https://www.churchillscholarship.org/" },
    { title: "Clarendon Scholarship", description: "Oxford graduate scholarship for international students", degree_levels: ["Master", "PhD"], country: "United Kingdom", fundType: "Full Funding", requirements: "Undergraduate degree", originalUrl: "https://www.clarendon.ox.ac.uk/" },

    // Germany
    { title: "DAAD Scholarship", description: "German government scholarships for international students", degree_levels: ["Master", "PhD"], country: "Germany", fundType: "Full Funding", requirements: "Bachelor's degree", originalUrl: "https://www.daad.de/en/" },
    { title: "Heinrich Böll Scholarship", description: "Green party foundation scholarship", degree_levels: ["Master", "PhD"], country: "Germany", fundType: "Full Funding", requirements: "Bachelor's degree, academic merit", originalUrl: "https://www.boell.de/en/" },
    { title: "Friedrich Ebert Scholarship", description: "Social democratic foundation scholarship", degree_levels: ["Master", "PhD"], country: "Germany", fundType: "Full Funding", requirements: "Bachelor's degree, civic engagement", originalUrl: "https://www.fes.de/" },
    { title: "Konrad Adenauer Scholarship", description: "Political foundation scholarship", degree_levels: ["Master", "PhD"], country: "Germany", fundType: "Full Funding", requirements: "Bachelor's degree", originalUrl: "https://www.kas.de/" },

    // France
    { title: "Eiffel Excellence Scholarship", description: "French government scholarship for international students", degree_levels: ["Master", "PhD"], country: "France", fundType: "Full Funding", requirements: "Bachelor's degree", originalUrl: "https://www.campusfrance.org/en/" },
    { title: "France Excellence Scholarship", description: "French embassy scholarships", degree_levels: ["Master"], country: "France", fundType: "Scholarship", requirements: "Bachelor's degree", originalUrl: "https://en.france-campusuniversite.com/" },
    { title: "Marie Curie Scholarship", description: "Science and engineering scholarship", degree_levels: ["Master", "PhD"], country: "France", fundType: "Full Funding", requirements: "STEM degree", originalUrl: "https://www.chambre.com/" },

    // Australia
    { title: "Australia Awards Scholarship", description: "Australian government scholarships", degree_levels: ["Master", "PhD"], country: "Australia", fundType: "Full Funding", requirements: "Citizenship in eligible country", originalUrl: "https://www.dfat.gov.au/" },
    { title: "Research Training Program", description: "Australian Research Council postgraduate scholarships", degree_levels: ["PhD"], country: "Australia", fundType: "Full Funding", requirements: "Research proposal", originalUrl: "https://www.education.gov.au/" },
    { title: "Adelaide Scholarship", description: "University of Adelaide international scholarships", degree_levels: ["Master", "PhD"], country: "Australia", fundType: "Full Funding", requirements: "Academic merit", originalUrl: "https://www.adelaide.edu.au/" },
    { title: "Melbourne Scholarship", description: "University of Melbourne graduate scholarships", degree_levels: ["Master", "PhD"], country: "Australia", fundType: "Full Funding", requirements: "Bachelor's degree", originalUrl: "https://www.unimelb.edu.au/" },

    // Canada
    { title: "Vanier Canada Graduate Scholarship", description: "Top doctoral students in Canada", degree_levels: ["PhD"], country: "Canada", fundType: "Full Funding", requirements: "PhD program, academic excellence", originalUrl: "https://www.vaniercollege.ca/" },
    { title: "Canada Graduate Scholarship", description: "Master's research scholarship", degree_levels: ["Master"], country: "Canada", fundType: "Full Funding", requirements: "Master's program", originalUrl: "https://www.nsercrees.gc.ca/" },
    { title: "Lester B. Pearson Scholarship", description: "University of Toronto scholarship", degree_levels: ["Bachelor"], country: "Canada", fundType: "Full Funding", requirements: "International student", originalUrl: "https://www.utoronto.ca/" },
    { title: "University of British Columbia Scholarship", description: "UBC international student awards", degree_levels: ["Master", "PhD"], country: "Canada", fundType: "Full Funding", requirements: "Academic merit", originalUrl: "https://www.ubc.ca/" },
    { title: "McGill Scholarship", description: "McGill University scholarships", degree_levels: ["Master", "PhD"], country: "Canada", fundType: "Full Funding", requirements: "Bachelor's degree", originalUrl: "https://www.mcgill.ca/" },

    // Japan
    { title: "MEXT Scholarship", description: "Japanese government scholarship for all levels", degree_levels: ["Bachelor", "Master", "PhD"], country: "Japan", fundType: "Full Funding", requirements: "Bachelor's degree", originalUrl: "https://www.mext.go.jp/en/" },
    { title: "JICA Scholarship", description: "Japan International Cooperation scholarship", degree_levels: ["Master"], country: "Japan", fundType: "Full Funding", requirements: "Work experience", originalUrl: "https://www.jica.go.jp/" },
    { title: "JASSO Scholarship", description: "Japan Student Services Organization", degree_levels: ["Bachelor", "Master"], country: "Japan", fundType: "Scholarship", requirements: "Enrolled in Japanese university", originalUrl: "https://www.jasso.go.jp/" },

    // Netherlands
    { title: "Holland Scholarship", description: "Dutch ministry for non-EU students", degree_levels: ["Master"], country: "Netherlands", fundType: "Scholarship", requirements: "Non-EU student", originalUrl: "https://www.studyinholland.nl/" },
    { title: "Amsterdam Scholarship", description: "University of Amsterdam scholarships", degree_levels: ["Master"], country: "Netherlands", fundType: "Scholarship", requirements: "Academic merit", originalUrl: "https://www.uva.nl/" },
    { title: "Leiden University Scholarship", description: "Leiden University excellence", degree_levels: ["Master", "PhD"], country: "Netherlands", fundType: "Scholarship", requirements: "Bachelor's degree", originalUrl: "https://www.leiden.edu/" },
    { title: "Delft University Scholarship", description: "TU Delft scholarships", degree_levels: ["Master"], country: "Netherlands", fundType: "Full Funding", requirements: "Engineering degree", originalUrl: "https://www.tudelft.nl/" },

    // Switzerland
    { title: "Swiss Government Excellence Scholarship", description: "Swiss Federal scholarship", degree_levels: ["Master", "PhD"], country: "Switzerland", fundType: "Full Funding", requirements: "Bachelor's degree", originalUrl: "https://www.sbfi.admin.ch/sbfi/en/" },
    { title: "EPFL Excellence Fellowship", description: "EPFL master's scholarship", degree_levels: ["Master"], country: "Switzerland", fundType: "Full Funding", requirements: "Bachelor's in STEM", originalUrl: "https://www.epfl.ch/" },
    { title: "ETH Zurich Scholarship", description: "ETH Zurich excellence awards", degree_levels: ["Master"], country: "Switzerland", fundType: "Full Funding", requirements: "Academic excellence", originalUrl: "https://www.ethz.ch/" },

    // Sweden
    { title: "Swedish Institute Scholarship", description: "Swedish government scholarship", degree_levels: ["Master"], country: "Sweden", fundType: "Full Funding", requirements: "Bachelor's degree", originalUrl: "https://si.se/" },
    { title: "Karolinska Institute Scholarship", description: "Karolinska Institute awards", degree_levels: ["Master", "PhD"], country: "Sweden", fundType: "Scholarship", requirements: "Biomedical field", originalUrl: "https://ki.se/en/" },
    { title: "Uppsala University Scholarship", description: "Uppsala international scholarships", degree_levels: ["Master"], country: "Sweden", fundType: "Scholarship", requirements: "Academic merit", originalUrl: "https://www.uu.se/" },

    // Italy
    { title: "Italian Government Scholarship", description: "Italian Ministry of Foreign Affairs", degree_levels: ["Master", "PhD"], country: "Italy", fundType: "Full Funding", requirements: "Bachelor's degree", originalUrl: "https://www.esteri.it/" },
    { title: "Bocconi Scholarship", description: "Bocconi University scholarships", degree_levels: ["Master"], country: "Italy", fundType: "Full Funding", requirements: "Business/economics", originalUrl: "https://www.unibocconi.it/" },
    { title: "Politecnico Scholarship", description: "Politecnico di Milano awards", degree_levels: ["Master"], country: "Italy", fundType: "Scholarship", requirements: "Engineering/architecture", originalUrl: "https://www.polimi.it/" },

    // Spain
    { title: "La Caixa Fellowship", description: "La Caixa Foundation scholarships", degree_levels: ["Master", "PhD"], country: "Spain", fundType: "Full Funding", requirements: "Academic excellence", originalUrl: "https://fundacionlacaixa.org/" },
    { title: "Madrid Scholarship", description: "Madrid regional scholarships", degree_levels: ["Master"], country: "Spain", fundType: "Scholarship", requirements: "Residency in Madrid", originalUrl: "https://www.comunidad.madrid/" },
    { title: "Barcelona GSE Scholarship", description: "Barcelona Graduate School scholarships", degree_levels: ["Master"], country: "Spain", fundType: "Scholarship", requirements: "Economics master's", originalUrl: "https://www.barcelonagse.com/" },

    // China
    { title: "Chinese Government Scholarship", description: "Chinese government full scholarship", degree_levels: ["Bachelor", "Master", "PhD"], country: "China", fundType: "Full Funding", requirements: "Bachelor's degree", originalUrl: "https://www.csc.edu.cn/" },
    { title: "Confucius Scholarship", description: "Chinese language scholarship", degree_levels: ["Bachelor", "Master"], country: "China", fundType: "Full Funding", requirements: "Chinese language interest", originalUrl: "https://www.hanban.org/" },
    { title: "Yuan Scholarship", description: "Chinese university scholarships", degree_levels: ["Master", "PhD"], country: "China", fundType: "Full Funding", requirements: "Academic merit", originalUrl: "https://www.cdgdc.edu.cn/" },

    // South Korea
    { title: "Korean Government Scholarship", description: "KGSP government scholarship", degree_levels: ["Bachelor", "Master", "PhD"], country: "South Korea", fundType: "Full Funding", requirements: "Bachelor's degree", originalUrl: "https://www.niied.go.kr/" },
    { title: "KIAT Scholarship", description: "Korea Institute of Science and Technology", degree_levels: ["Master", "PhD"], country: "South Korea", fundType: "Full Funding", requirements: "STEM field", originalUrl: "https://www.kitech.re.kr/" },
    { title: "Seoul National University Scholarship", description: "SNU international scholarships", degree_levels: ["Master", "PhD"], country: "South Korea", fundType: "Full Funding", requirements: "Academic excellence", originalUrl: "https://www.snu.ac.kr/" },

    // Singapore
    { title: "Singapore Government Scholarship", description: "Singapore Ministry of Education", degree_levels: ["Master", "PhD"], country: "Singapore", fundType: "Full Funding", requirements: "Academic merit", originalUrl: "https://www.moe.gov.sg/" },
    { title: "NUS Scholarship", description: "National University of Singapore", degree_levels: ["Master", "PhD"], country: "Singapore", fundType: "Full Funding", requirements: "Bachelor's degree", originalUrl: "https://www.nus.edu.sg/" },
    { title: "NTU Scholarship", description: "Nanyang Technological University", degree_levels: ["Master", "PhD"], country: "Singapore", fundType: "Full Funding", requirements: "Engineering/business", originalUrl: "https://www.ntu.edu.sg/" },

    // Hong Kong
    { title: "Hong Kong PhD Fellowship", description: "Hong Kong Research Grants Council", degree_levels: ["PhD"], country: "Hong Kong", fundType: "Full Funding", requirements: "PhD program", originalUrl: "https://www.ugc.edu.hk/" },
    { title: "HKU Scholarship", description: "University of Hong Kong scholarships", degree_levels: ["Master", "PhD"], country: "Hong Kong", fundType: "Full Funding", requirements: "Academic excellence", originalUrl: "https://www.hku.hk/" },
    { title: "CUHK Scholarship", description: "Chinese University of Hong Kong", degree_levels: ["Master", "PhD"], country: "Hong Kong", fundType: "Scholarship", requirements: "Bachelor's degree", originalUrl: "https://www.cuhk.edu.hk/" },

    // New Zealand
    { title: "New Zealand Scholarship", description: "NZ government international awards", degree_levels: ["Bachelor", "Master", "PhD"], country: "New Zealand", fundType: "Full Funding", requirements: "Citizenship in eligible country", originalUrl: "https://www.studyinnewzealand.govt.nz/" },
    { title: "Auckland Scholarship", description: "University of Auckland scholarships", degree_levels: ["Master", "PhD"], country: "New Zealand", fundType: "Full Funding", requirements: "Academic merit", originalUrl: "https://www.auckland.ac.nz/" },
    { title: "Otago Scholarship", description: "University of Otago scholarships", degree_levels: ["Master", "PhD"], country: "New Zealand", fundType: "Scholarship", requirements: "Undergraduate degree", originalUrl: "https://www.otago.ac.nz/" },

    // Ireland
    { title: "Irish Government Scholarship", description: "Irish Department of Education", degree_levels: ["Master", "PhD"], country: "Ireland", fundType: "Full Funding", requirements: "Non-EU student", originalUrl: "https://www.education.ie/" },
    { title: "Trinity College Scholarship", description: "Trinity College Dublin awards", degree_levels: ["Master", "PhD"], country: "Ireland", fundType: "Full Funding", requirements: "Academic excellence", originalUrl: "https://www.tcd.ie/" },
    { title: "UCD Scholarship", description: "University College Dublin scholarships", degree_levels: ["Master"], country: "Ireland", fundType: "Scholarship", requirements: "Bachelor's degree", originalUrl: "https://www.ucd.ie/" },

    // Belgium
    { title: "Flanders Scholarship", description: "Flanders government scholarship", degree_levels: ["Master"], country: "Belgium", fundType: "Scholarship", requirements: "Non-EU student", originalUrl: "https://www.studyinflanders.be/" },
    { title: "ULB Scholarship", description: "Free University of Brussels", degree_levels: ["Master", "PhD"], country: "Belgium", fundType: "Scholarship", requirements: "Academic merit", originalUrl: "https://www.ulb.be/" },

    // Austria
    { title: "Austrian Government Scholarship", description: "Austrian Ministry of Education", degree_levels: ["Master", "PhD"], country: "Austria", fundType: "Full Funding", requirements: "Bachelor's degree", originalUrl: "https://www.bmbwf.gv.at/" },
    { title: "Vienna University Scholarship", description: "University of Vienna awards", degree_levels: ["Master", "PhD"], country: "Austria", fundType: "Scholarship", requirements: "Academic merit", originalUrl: "https://www.univie.ac.at/" },

    // Denmark
    { title: "Danish Government Scholarship", description: "Danish Ministry of Higher Education", degree_levels: ["Master"], country: "Denmark", fundType: "Scholarship", requirements: "Non-EU student", originalUrl: "https://www.ufm.dk/" },
    { title: "Copenhagen Scholarship", description: "University of Copenhagen", degree_levels: ["Master", "PhD"], country: "Denmark", fundType: "Scholarship", requirements: "Academic excellence", originalUrl: "https://www.ku.dk/" },

    // Norway
    { title: "Norwegian Government Scholarship", description: "Norwegian State Educational Loan Fund", degree_levels: ["Master", "PhD"], country: "Norway", fundType: "Scholarship", requirements: "International student", originalUrl: "https://www.lanekassen.no/" },
    { title: "Oslo Scholarship", description: "University of Oslo scholarships", degree_levels: ["Master", "PhD"], country: "Norway", fundType: "Scholarship", requirements: "Academic merit", originalUrl: "https://www.uio.no/" },

    // Finland
    { title: "Finnish Government Scholarship", description: "Finnish Ministry of Education", degree_levels: ["Master", "PhD"], country: "Finland", fundType: "Full Funding", requirements: "Non-EU student", originalUrl: "https://www.oph.fi/" },
    { title: "Aalto Scholarship", description: "Aalto University scholarships", degree_levels: ["Master"], country: "Finland", fundType: "Scholarship", requirements: "Engineering/business", originalUrl: "https://www.aalto.fi/" },

    // Denmark
    { title: "Novo Nordisk Scholarship", description: "Novo Nordisk Foundation grants", degree_levels: ["Master", "PhD"], country: "Denmark", fundType: "Full Funding", requirements: "Life sciences", originalUrl: "https://www.novonordiskfoundation.com/" },

    // Europe
    { title: "Erasmus+ Scholarship", description: "EU student mobility program", degree_levels: ["Master"], country: "Europe", fundType: "Scholarship", requirements: "EU university student", originalUrl: "https://erasmus-plus.ec.europa.eu/" },
    { title: "EU Blue Card", description: "EU work and residence permit", degree_levels: ["Master"], country: "Europe", fundType: "Work Permit", requirements: "University degree", originalUrl: "https://ec.europa.eu/" },
    { title: "Marie Skłodowska-Curie Actions", description: "EU research fellowships", degree_levels: ["PhD"], country: "Europe", fundType: "Full Funding", requirements: "Research experience", originalUrl: "https://mariesklodowska-curie-actions.ec.europa.eu/" },

    // India
    { title: "Indo-US Fellowship", description: "Indo-US Science and Technology Forum", degree_levels: ["Master", "PhD"], country: "India", fundType: "Fellowship", requirements: "Research in India/USA", originalUrl: "https://www.iusstf.org/" },
    { title: "National Scholarship Portal", description: "Indian government scholarships", degree_levels: ["Bachelor", "Master"], country: "India", fundType: "Scholarship", requirements: "Indian citizen", originalUrl: "https://www.scholarships.gov.in/" },

    // UAE
    { title: "UAE Scholarship", description: "UAE government scholarships", degree_levels: ["Master", "PhD"], country: "UAE", fundType: "Full Funding", requirements: "Academic excellence", originalUrl: "https://www.moei.gov.ae/" },
    { title: "Khalifa Scholarship", description: "Khalifa University scholarships", degree_levels: ["Master", "PhD"], country: "UAE", fundType: "Full Funding", requirements: "Engineering", originalUrl: "https://www.ku.ac.ae/" },

    // Saudi Arabia
    { title: "Saudi Arabia Scholarship", description: "Saudi Cultural Mission", degree_levels: ["Master", "PhD"], country: "Saudi Arabia", fundType: "Full Funding", requirements: "Saudi citizen", originalUrl: "https://www.mohe.gov.sa/" },

    // International/General
    { title: "World Bank Scholarship", description: "World Bank Group scholarships", degree_levels: ["Master", "PhD"], country: "International", fundType: "Full Funding", requirements: "Developing country citizen", originalUrl: "https://www.worldbank.org/" },
    { title: "UNDP Scholarship", description: "United Nations Development Program", degree_levels: ["Master", "PhD"], country: "International", fundType: "Fellowship", requirements: "Development sector", originalUrl: "https://www.undp.org/" },
    { title: "OECD Scholarship", description: "Organization for Economic Co-operation", degree_levels: ["Master"], country: "International", fundType: "Scholarship", requirements: "Economics/public policy", originalUrl: "https://www.oecd.org/" },
    { title: "World Health Organization Scholarship", description: "WHO global health scholarships", degree_levels: ["Master", "PhD"], country: "International", fundType: "Full Funding", requirements: "Health sector", originalUrl: "https://www.who.int/" },
    { title: "UNICEF Scholarship", description: "UNICEF fellowship program", degree_levels: ["Master", "PhD"], country: "International", fundType: "Fellowship", requirements: "Child rights sector", originalUrl: "https://www.unicef.org/" },
    { title: "Clinton Global Initiative", description: "Clinton Foundation scholarships", degree_levels: ["Master"], country: "International", fundType: "Fellowship", requirements: "Social impact", originalUrl: "https://www.clintonfoundation.org/" },
    { title: "Gates Foundation Scholarship", description: "Bill and Melinda Gates Foundation", degree_levels: ["Master", "PhD"], country: "International", fundType: "Full Funding", requirements: "Global health/development", originalUrl: "https://www.gatesfoundation.org/" },
    { title: "Rotary Scholarship", description: "Rotary Foundation global grants", degree_levels: ["Master"], country: "International", fundType: "Scholarship", requirements: "Rotary member", originalUrl: "https://www.rotary.org/" },
    { title: " Fulbright Scholar Program", description: "Fulbright scholar awards", degree_levels: ["PhD"], country: "USA", fundType: "Fellowship", requirements: "PhD, research proposal", originalUrl: "https://fulbrightscholar.org/" },
    { title: "Pew Research Fellowship", description: "Pew Charitable Trusts", degree_levels: ["PhD"], country: "USA", fundType: "Fellowship", requirements: "Research experience", originalUrl: "https://www.pewtrusts.org/" },
    { title: "Ford Foundation Fellowship", description: "Ford Foundation predoctoral", degree_levels: ["PhD"], country: "USA", fundType: "Full Funding", requirements: "Underrepresented groups", originalUrl: "https://sites.nationalacademies.org/pga/fordfoundation/" },
    { title: "NSF Graduate Research Fellowship", description: "National Science Foundation", degree_levels: ["Master", "PhD"], country: "USA", fundType: "Full Funding", requirements: "STEM research", originalUrl: "https://www.nsfgrfp.org/" },
    { title: "Hertz Foundation Fellowship", description: "Hertz Foundation scholarship", degree_levels: ["PhD"], country: "USA", fundType: "Full Funding", requirements: "Applied physical sciences", originalUrl: "https://www.hertzfoundation.org/" },
    { title: "Jack Kent Cooke Scholarship", description: "Jack Kent Cooke Foundation", degree_levels: ["Bachelor", "Master"], country: "USA", fundType: "Full Funding", requirements: "Academic excellence, financial need", originalUrl: "https://www.jkcf.org/" }
];

async function seedScholarships() {
    await sequelize.authenticate();
    console.log('Connected to DB');

    let created = 0;
    let skipped = 0;

    for (const data of scholarships) {
        try {
            await Scholarship.create({
                ...data,
                deadline: new Date("2026-12-31")
            });
            console.log(`Created: ${data.title}`);
            created++;
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                skipped++;
            } else {
                console.error(`Error: ${data.title} - ${err.message}`);
            }
        }
    }

    const count = await Scholarship.count();
    console.log(`\nCreated: ${created}, Skipped (already exists): ${skipped}`);
    console.log(`Total scholarships in DB: ${count}`);
    process.exit(0);
}

seedScholarships();