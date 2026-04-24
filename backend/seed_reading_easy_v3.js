
import { Sequelize } from 'sequelize';
import configs from './dist/config/configs.js';

const sequelize = new Sequelize(configs.DB_NAME, configs.DB_USER, configs.DB_PASSWORD, {
  host: configs.DB_HOST,
  port: configs.DB_PORT,
  dialect: 'postgres',
  logging: false,
  dialectOptions: configs.NODE_ENV === "production" ? {
    ssl: { require: true, rejectUnauthorized: false }
  } : {}
});

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Clear old Reading Easy IELTS videos to ensure order
    await sequelize.query(`DELETE FROM videos WHERE type = 'Reading' AND level = 'easy' AND exam_type = 'IELTS'`);

    const videos = [
      // Mission 1: The Bird's Eye View
      { title: "IELTS Reading: Timing & Speed Guide", description: "Detailed 25-minute guide on timing and managing the clock.", videolink: "http://www.youtube.com/watch?v=ZMVkP5ZD-6U", duration: "25:12 mins" },
      { title: "Reading Test Structure Overview", description: "Great overview of test structure and approach for beginners.", videolink: "http://www.youtube.com/watch?v=apOCnYpR-9g", duration: "12:45 mins" },
      { title: "Strict Time Constraints Mastery", description: "Shows how to approach a test with strict time constraints effectively.", videolink: "http://www.youtube.com/watch?v=a0fOt81glvA", duration: "08:20 mins" },
      { title: "Reading Speed & Structure Hacks", description: "Quick hack for improving your reading speed and understanding structure.", videolink: "http://www.youtube.com/watch?v=8b5qxcKNT0s", duration: "05:15 mins" },
      { title: "Essential Reading Habits", description: "Short introduction to key habits needed for a high score.", videolink: "http://www.youtube.com/watch?v=ia5lhvGE9mU", duration: "06:40 mins" },
      
      // Mission 2: Skimming vs. Scanning
      { title: "Skimming vs Scanning: The Basics", description: "Clear visual explanation of the differences between these two vital skills.", videolink: "http://www.youtube.com/watch?v=RtcXr0_201A", duration: "09:30 mins" },
      { title: "Efficient Reading Tutorial", description: "In-depth tutorial on reading efficiently without losing comprehension.", videolink: "http://www.youtube.com/watch?v=ojvgT62XtpY", duration: "15:10 mins" },
      { title: "Skimming Practical Application", description: "Practical application of skimming techniques to real IELTS texts.", videolink: "http://www.youtube.com/watch?v=kPhbQ8CGJ3k", duration: "11:00 mins" },
      { title: "Defining Skimming & Scanning", description: "Short, exact definition of the two methods and when to use each.", videolink: "http://www.youtube.com/watch?v=Jnyb-URnrTg", duration: "04:50 mins" },
      { title: "Reading Strategy Integration", description: "Discusses how skimming and scanning fit into the larger test strategy.", videolink: "http://www.youtube.com/watch?v=apOCnYpR-9g", duration: "12:15 mins" },
      
      // Mission 3: The Power of Paraphrasing
      { title: "Foundations of Paraphrasing", description: "Highly regarded foundational lesson on paraphrasing for reading.", videolink: "http://www.youtube.com/watch?v=rlsqbSFOBCg", duration: "14:20 mins" },
      { title: "4 Paraphrasing Techniques", description: "Step-by-step breakdown of 4 techniques to identify synonyms in text.", videolink: "http://www.youtube.com/watch?v=lk9t-M-FC-c", duration: "10:35 mins" },
      { title: "IELTS Vocabulary Builder", description: "Excellent vocabulary builder focusing on reading synonyms.", videolink: "http://www.youtube.com/watch?v=8oYpg7Gb1QI", duration: "08:12 mins" },
      { title: "Spotting Test-Maker Language", description: "Focuses on the exact words and synonyms the test makers use.", videolink: "http://www.youtube.com/watch?v=4h9lQfYLOZU", duration: "07:45 mins" },
      { title: "Synonym Recognition Drill", description: "Quick drill for recognizing synonyms under pressure.", videolink: "http://www.youtube.com/watch?v=YmQoNvvg2Uo", duration: "05:55 mins" },
      
      // Mission 4: Conquering the MCQ
      { title: "MCQ Tackling Strategy", description: "Comprehensive strategy for tackling Multiple Choice Questions.", videolink: "http://www.youtube.com/watch?v=CFXiTWdb4mY", duration: "18:25 mins" },
      { title: "Eliminating MCQ Distractors", description: "Focuses heavily on identifying and eliminating distractors in MCQs.", videolink: "http://www.youtube.com/watch?v=Fg8UVyyKg2k", duration: "12:10 mins" },
      { title: "Interactive MCQ Practice", description: "Excellent interactive practice and breakdown of MCQ tasks.", videolink: "http://www.youtube.com/watch?v=XuRfzG7zRzE", duration: "14:50 mins" },
      { title: "Identifying MCQ Tricks", description: "Clear logic for identifying trick answers in Section 3.", videolink: "http://www.youtube.com/watch?v=Jmou3BeHkfw", duration: "09:40 mins" },
      { title: "MCQ Methodology for Beginners", description: "Detailed methodology for beginners tackling their first MCQs.", videolink: "http://www.youtube.com/watch?v=YoiAjosGc-0", duration: "11:20 mins" },
      
      // Mission 5: Review & Reinforce
      { title: "Full Passage Walkthrough", description: "A complete 30-minute walkthrough of a full IELTS reading passage.", videolink: "http://www.youtube.com/watch?v=y5s03jaaDeI", duration: "32:00 mins" },
      { title: "Technique Application Mastery", description: "Great reinforcement of techniques applied to complex academic text.", videolink: "http://www.youtube.com/watch?v=ImlAlxjoI6s", duration: "15:45 mins" },
      { title: "Skill Synthesis Final", description: "Brings all previous skills together in one final practice session.", videolink: "http://www.youtube.com/watch?v=G8Y2liwGRl8", duration: "20:10 mins" },
      { title: "Reading Fundamentals Review", description: "Quick review of fundamentals before starting your final practice.", videolink: "http://www.youtube.com/watch?v=ia5lhvGE9mU", duration: "06:15 mins" },
      { title: "Final Speed Techniques", description: "Final review of speed techniques to ensure you finish on time.", videolink: "http://www.youtube.com/watch?v=8b5qxcKNT0s", duration: "05:30 mins" }
    ];

    for (const v of videos) {
      const videoId = v.videolink.split('v=')[1];
      const thubnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      
      await sequelize.query(
        `INSERT INTO videos (title, description, video_link, thumbnail_link, level, type, exam_type, duration, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        { replacements: [v.title, v.description, v.videolink, thubnail, 'easy', 'Reading', 'IELTS', v.duration] }
      );
    }

    console.log(`Successfully seeded ${videos.length} reading videos with metadata.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
