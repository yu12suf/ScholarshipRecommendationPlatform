
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

    // Clear old Listening Easy IELTS videos
    await sequelize.query(`DELETE FROM videos WHERE type = 'Listening' AND level = 'easy' AND exam_type = 'IELTS'`);

    const videos = [
      // Mission 1: Precision Hearing
      { 
        title: "IELTS Spelling Names Test", 
        description: "A practical listening and spelling test focusing on accurately identifying and writing people's names.", 
        videolink: "http://www.youtube.com/watch?v=rrjWWZud-B8",
        duration: "10:25 mins"
      },
      { 
        title: "Numbers & Letters Drill", 
        description: "Essential drill practice for combinations of numbers and letters, typical for Section 1 phone numbers and postcodes.", 
        videolink: "http://www.youtube.com/watch?v=E-AM9uHi8n0",
        duration: "08:45 mins"
      },
      { 
        title: "Foundation Listening Practice", 
        description: "A foundational level practice session covering numbers, names, dates, and addresses at an easy pace.", 
        videolink: "http://www.youtube.com/watch?v=2g-RK5iyHGw",
        duration: "14:12 mins"
      },
      { 
        title: "High-Pressure Spelling Secrets", 
        description: "Step-by-step breakdown of how to handle high-pressure spelling tasks in Section 1.", 
        videolink: "http://www.youtube.com/watch?v=7_AXxa5-xYM",
        duration: "06:30 mins"
      },
      { 
        title: "Beginner Dictation: Names & Numbers", 
        description: "A comprehensive dictation practice specifically targeting spelling, names, and numbers for beginners.", 
        videolink: "http://www.youtube.com/watch?v=Q9pTofgoPf4",
        duration: "12:55 mins"
      },
      
      // Mission 2: Situational Tracking
      { 
        title: "Map & Plan Strategy Guide", 
        description: "A step-by-step strategy for tackling IELTS Listening map and plan questions without getting lost.", 
        videolink: "http://www.youtube.com/watch?v=twjWvYQ-saM",
        duration: "11:20 mins"
      },
      { 
        title: "Complex Map Tracking Techniques", 
        description: "Asad Yaqub breaks down the best solutions and tracking techniques for complex map directions.", 
        videolink: "http://www.youtube.com/watch?v=BLdxD0EMn64",
        duration: "18:40 mins"
      },
      { 
        title: "Proven Map Methodology", 
        description: "A proven method for following the speaker's directions in Section 2 maps and diagrams.", 
        videolink: "http://www.youtube.com/watch?v=-aBW-RHtcrE",
        duration: "13:15 mins"
      },
      { 
        title: "Sports Centre Map Challenge", 
        description: "An active practice session featuring a sports and leisure centre map with a full script review.", 
        videolink: "http://www.youtube.com/watch?v=Wi4bb4hBvHI",
        duration: "16:50 mins"
      },
      { 
        title: "Essential Directional Vocabulary", 
        description: "A guide to the essential directional vocabulary needed to track movements on a map accurately.", 
        videolink: "http://www.youtube.com/watch?v=FQ1T-Nm1cGA",
        duration: "09:10 mins"
      },
      
      // Mission 3: The Echo Trap
      { 
        title: "4 Biggest Listening Traps (E2 Jay)", 
        description: "Jay from E2 explains the 4 biggest distractors and traps you will encounter in the IELTS Listening test.", 
        videolink: "http://www.youtube.com/watch?v=hOAsUNNyPIs",
        duration: "07:35 mins"
      },
      { 
        title: "Section 1 Self-Correction Breakdown", 
        description: "A breakdown of Section 1 traps, specifically how speakers correct themselves and how to catch the final answer.", 
        videolink: "http://www.youtube.com/watch?v=WCF4oI5mTJU",
        duration: "05:50 mins"
      },
      { 
        title: "Distractor Mistakes Overview", 
        description: "A short but powerful overview of the worst mistakes students make when falling for distractors.", 
        videolink: "http://www.youtube.com/watch?v=w31ZnwMH2k8",
        duration: "04:15 mins"
      },
      { 
        title: "Unbeatable Audio Trap Tips", 
        description: "Quick, unbeatable tips to track audio traps, self-corrections, and avoid losing easy points.", 
        videolink: "http://www.youtube.com/watch?v=pyCyUoGncSM",
        duration: "03:45 mins"
      },
      { 
        title: "Hidden Trick Identification", 
        description: "Hidden tips for identifying common tricks and maintaining focus when the speaker changes their mind.", 
        videolink: "http://www.youtube.com/watch?v=QJgn67JU6T8",
        duration: "05:10 mins"
      }
    ];

    for (const v of videos) {
      const videoId = v.videolink.split('v=')[1];
      const thubnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      
      await sequelize.query(
        `INSERT INTO videos (title, description, video_link, thumbnail_link, level, type, exam_type, duration, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        { replacements: [v.title, v.description, v.videolink, thubnail, 'easy', 'Listening', 'IELTS', v.duration] }
      );
    }

    console.log(`Successfully seeded ${videos.length} listening videos with new curriculum.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
