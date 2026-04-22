const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
});

async function seed() {
  try {
    await sequelize.query(`
      INSERT INTO visa_guidelines (id, country, visa_type, required_documents, common_questions, created_at, updated_at)
      VALUES 
      (gen_random_uuid(), 'USA', 'F-1 Student Visa', 
       '["I-20 Form", "DS-160 Confirmation", "SEVIS Fee Receipt", "Passport", "Financial Proof"]'::jsonb,
       '["Why did you choose this university?", "Who is sponsoring your education?", "What are your plans after graduation?"]'::jsonb,
       NOW(), NOW()),
      (gen_random_uuid(), 'UK', 'Student Visa (Tier 4)', 
       '["CAS Statement", "Passport", "TB Test Results", "Financial Records"]'::jsonb,
       '["Why the UK instead of your home country?", "What course are you studying?", "Where will you be staying?"]'::jsonb,
       NOW(), NOW()),
      (gen_random_uuid(), 'Canada', 'Study Permit',
       '["Letter of Acceptance", "Identity Proof", "Financial Support Proof", "Letter of Explanation"]'::jsonb,
       '["Why Canada?", "What is your educational background?", "How will you support yourself?"]'::jsonb,
       NOW(), NOW())
      ON CONFLICT (country) DO NOTHING;
    `);
    console.log("Guidelines seeded successfully");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await sequelize.close();
  }
}

seed();
