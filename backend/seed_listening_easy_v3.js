
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

    // Clear old Listening Easy IELTS videos to ensure order
    await sequelize.query(`DELETE FROM videos WHERE type = 'Listening' AND level = 'easy' AND exam_type = 'IELTS'`);

    const videos = [
      // Mission 1: Precision Hearing
      { 
        title: "Self-study IELTS: Listening Part 1 - Numbers and Dates",
        description: "Beginner-friendly practice for hearing and noting numbers/dates in everyday conversations, with clear enunciation and answers.",
        videolink: "https://www.youtube.com/watch?v=sYG-BKgV678", 
        thubnail: "https://img.youtube.com/vi/sYG-BKgV678/hqdefault.jpg" 
      },
      { 
        title: "IELTS Listening Practice - Listening Test - Numbers",
        description: "Simple audio drills on writing numbers accurately, ideal for Section 1 spelling and precision.",
        videolink: "https://www.youtube.com/watch?v=o7O4oQqWA1M", 
        thubnail: "https://img.youtube.com/vi/o7O4oQqWA1M/hqdefault.jpg" 
      },
      { 
        title: "Surnames, Telephone Numbers, Street Names and Email Addresses",
        description: "Focuses on listening for names, phone numbers, and addresses in slow, clear speech for easy Section 1 practice.",
        videolink: "https://www.youtube.com/watch?v=MgWfkrMOhV0", 
        thubnail: "https://img.youtube.com/vi/MgWfkrMOhV0/hqdefault.jpg" 
      },
      { 
        title: "IELTS Listening Section 1: Time Test",
        description: "Targets times, dates, and numbers in casual dialogues, with tips for basic learners.",
        videolink: "https://www.youtube.com/watch?v=UKdZALEoa4o", 
        thubnail: "https://img.youtube.com/vi/UKdZALEoa4o/hqdefault.jpg" 
      },
      { 
        title: "IELTS Listening: Problems with numbers",
        description: "Explains common number confusions (e.g., 15 vs. 50) with tests, perfect for building confidence.",
        videolink: "https://www.youtube.com/watch?v=HYp08TMG5uw", 
        thubnail: "https://img.youtube.com/vi/HYp08TMG5uw/hqdefault.jpg" 
      },
      // Mission 2: Situational Tracking
      { 
        title: "LISTENING – SECTION 2 | IELTS CLASS 03 | Map & Diagram Strategy",
        description: "Step-by-step map labeling with directions vocabulary, tailored for Section 2 beginners.",
        videolink: "https://www.youtube.com/watch?v=ph1EFfHpMX8", 
        thubnail: "https://img.youtube.com/vi/ph1EFfHpMX8/hqdefault.jpg" 
      },
      { 
        title: "IELTS Listening Practice: Follow the Directions and Label the Map",
        description: "Art gallery map challenge with clear audio clues and breakdowns for tracking locations.",
        videolink: "https://www.youtube.com/watch?v=OjLzrpCq__U", 
        thubnail: "https://img.youtube.com/vi/OjLzrpCq__U/hqdefault.jpg" 
      },
      { 
        title: "STOP Getting LOST on IELTS Listening MAPS",
        description: "Direction mastery and map tips with practice, avoiding common Section 2 pitfalls.",
        videolink: "https://www.youtube.com/watch?v=G-Yb4psq0h0", 
        thubnail: "https://img.youtube.com/vi/G-Yb4psq0h0/hqdefault.jpg" 
      },
      { 
        title: "IELTS Listening Map Labelling Practice with Alex!",
        description: "Explains map tasks with a practice example, focusing on spatial directions.",
        videolink: "https://www.youtube.com/watch?v=l1LKp-q9k50", 
        thubnail: "https://img.youtube.com/vi/l1LKp-q9k50/hqdefault.jpg" 
      },
      { 
        title: "IELTS Listening Test - Section 2 - Episode 01",
        description: "Multiple short Section 2 tracks on situational info like directions, with timestamps.",
        videolink: "https://www.youtube.com/watch?v=3FyVV4p-Oxw", 
        thubnail: "https://img.youtube.com/vi/3FyVV4p-Oxw/hqdefault.jpg" 
      },
      // Mission 3: The Echo Trap
      { 
        title: "IELTS Listening: Don't Make These 4 Mistakes!",
        description: "Covers distractors like similar sounds and corrections in easy examples from Sections 1-2.",
        videolink: "https://www.youtube.com/watch?v=hOAsUNNyPIs", 
        thubnail: "https://img.youtube.com/vi/hOAsUNNyPIs/hqdefault.jpg" 
      },
      { 
        title: "IELTS Listening - The Complete Guide - Part 1/4",
        description: "Highlights self-correction traps and prediction strategies with Section 1 audio practice.",
        videolink: "https://www.youtube.com/watch?v=i1vqbto3C_E", 
        thubnail: "https://img.youtube.com/vi/i1vqbto3C_E/hqdefault.jpg" 
      },
      { 
        title: "Part 1 of IELTS Listening Skills",
        description: "Identifies distractors in basic conversations, with refreshers for easy-level tracking.",
        videolink: "https://www.youtube.com/watch?v=YWdVk4MKZ4I", 
        thubnail: "https://img.youtube.com/vi/YWdVk4MKZ4I/hqdefault.jpg" 
      },
      { 
        title: "IELTS practice test- listening part 1 section 1 and 2",
        description: "Full easy test with answers, showing where speakers correct or distract.",
        videolink: "https://www.youtube.com/watch?v=VSteuEhXQqY", 
        thubnail: "https://img.youtube.com/vi/VSteuEhXQqY/hqdefault.jpg" 
      },
      { 
        title: "IELTS Listening Test - Section 1 - Episode 02",
        description: "Everyday dialogues revealing distractors, great for spotting changes in info.",
        videolink: "https://www.youtube.com/watch?v=wR1e-j_ZbNs", 
        thubnail: "https://img.youtube.com/vi/wR1e-j_ZbNs/hqdefault.jpg" 
      }
    ];

    for (const v of videos) {
      await sequelize.query(
        `INSERT INTO videos (title, description, video_link, thumbnail_link, level, type, exam_type, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        { replacements: [v.title, v.description, v.videolink, v.thubnail, 'easy', 'Listening', 'IELTS'] }
      );
    }

    console.log(`Successfully seeded ${videos.length} listening videos with metadata.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
