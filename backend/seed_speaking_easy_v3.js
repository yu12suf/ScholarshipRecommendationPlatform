
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

    // Clear old Speaking Easy IELTS videos
    await sequelize.query(`DELETE FROM videos WHERE type = 'Speaking' AND level = 'easy' AND exam_type = 'IELTS'`);

    const videos = [
      // Mission 1: The Icebreaker
      { title: "Part 1 Sample Answers: Hometown", description: "Provides simple, easy-to-adapt sample answers and vocabulary for one of the most guaranteed Part 1 topics: where you live.", videolink: "http://www.youtube.com/watch?v=rETE_GoIwXw", duration: "11:45 mins" },
      { title: "Talking About Free Time & Hobbies", description: "A practical lesson on how to naturally discuss your hobbies and free time, which is essential for the introductory phase of the test.", videolink: "http://www.youtube.com/watch?v=hoyhPZDp3dE", duration: "09:30 mins" },
      { title: "Hometown Questions Step-by-Step", description: "Breaks down how to answer hometown questions step-by-step, showing the difference between basic answers and slightly expanded ones.", videolink: "http://www.youtube.com/watch?v=o6GqZ8e4J6Q", duration: "07:15 mins" },
      { title: "Part 1: Work and Studies", description: "A foundational guide on how to answer questions about your job or education confidently without overcomplicating your grammar.", videolink: "https://www.youtube.com/watch?v=1kf3PVM-FU0", duration: "06:50 mins" },
      { title: "Part 1 Topics & Questions Practice", description: "A great resource for students to practice a rapid-fire sequence of common Part 1 questions to get used to the pace of the test.", videolink: "http://www.youtube.com/watch?v=wrS0zKJV2Ms", duration: "14:20 mins" },
      
      // Mission 2: Clear Comms
      { title: "How to Avoid Filler Words", description: "A highly effective communication guide on how to stop saying 'um,' 'uh,' and 'like,' helping students sound much more fluent and confident.", videolink: "http://www.youtube.com/watch?v=hUY8DiQgUUg", duration: "10:10 mins" },
      { title: "Avoid Word Repetition", description: "A quick, digestible lesson on how to easily paraphrase basic words so students don't repeat the exact same vocabulary in every sentence.", videolink: "http://www.youtube.com/watch?v=Sf139dNs8IU", duration: "05:45 mins" },
      { title: "Better Connectors for Fluency", description: "Focuses on easy-to-learn connectors that smooth out speech and naturally reduce awkward pauses between ideas.", videolink: "http://www.youtube.com/watch?v=eig1L1OMZmY", duration: "08:12 mins" },
      { title: "Stop Translating in Your Head", description: "A great mindset video to help lower-level students break the habit of translating from their native language.", videolink: "https://www.youtube.com/watch?v=7JVb3-4tDSE", duration: "12:55 mins" },
      { title: "Filler Words vs. Pausing Demo", description: "A short, impactful demonstration showing exactly how much better an answer sounds simply by pausing instead of using filler noises.", videolink: "http://www.youtube.com/watch?v=oEhh9vbnMS8", duration: "04:30 mins" },
      
      // Mission 3: The Storyteller
      { title: "3 Steps to Perfect Part 2 Answer", description: "Provides a very simple, 3-step blueprint to ensure students stay on track and don't run out of things to say.", videolink: "http://www.youtube.com/watch?v=N3x1cvJoy38", duration: "15:20 mins" },
      { title: "Quick Prep Time Methods", description: "Teaches students exactly how to use their 1-minute planning time efficiently so they have a solid roadmap for their speech.", videolink: "http://www.youtube.com/watch?v=wTePj4_qGLE", duration: "06:15 mins" },
      { title: "3 Tips to Speak Non-Stop", description: "Easy-to-apply strategies that help students stretch their ideas naturally without repeating themselves or panicking.", videolink: "http://www.youtube.com/watch?v=pXrqy0_201A", duration: "08:40 mins" },
      { title: "The PPF (Past-Present-Future) Method", description: "Introduces the PPF method, a foolproof structural trick to organize long turns and show off basic tenses.", videolink: "https://www.youtube.com/watch?v=7JVb3-4tDSE", duration: "11:10 mins" },
      { title: "Using Prep Time Keywords", description: "A short, focused tutorial on writing down the right keywords on your scratch paper to guide your storytelling.", videolink: "http://www.youtube.com/watch?v=rWBrbXrNHwk", duration: "05:25 mins" },
      
      // Mission 4: Opinion Logic
      { title: "Part 3 Questions & Answers Guide", description: "Gives students a clear understanding of what Part 3 looks like and how to form basic, logical answers to abstract questions.", videolink: "http://www.youtube.com/watch?v=8HqbhyvfVu8", duration: "18:35 mins" },
      { title: "Agree/Disagree Answer Structure", description: "Clearly showcases the simple underlying structure of stating an opinion, giving a reason, and providing an example.", videolink: "http://www.youtube.com/watch?v=vGGof14virc", duration: "13:12 mins" },
      { title: "Giving Your Opinion in English", description: "An essential vocabulary lesson for lower-level students to learn different, easy ways to say 'I think' or 'I agree' in Part 3.", videolink: "https://www.youtube.com/watch?v=n_ArTMpxRp8", duration: "07:45 mins" },
      { title: "Structuring Part 3 (A.R.E. Framework)", description: "Teaches the 'A.R.E.' (Answer, Reason, Example) framework, the easiest way to build a Part 3 response.", videolink: "https://www.youtube.com/watch?v=jO0NP0qRU6Y", duration: "09:50 mins" },
      { title: "Expressions for Agreeing/Disagreeing", description: "A focused breakdown of easy phrases to safely and clearly agree or disagree with the examiner's prompts.", videolink: "https://www.youtube.com/watch?v=wTePj4_qGLE", duration: "06:10 mins" }
    ];

    for (const v of videos) {
      let videoId = '';
      if (v.videolink.includes('v=')) {
        videoId = v.videolink.split('v=')[1].split('&')[0];
      } else if (v.videolink.includes('be/')) {
        videoId = v.videolink.split('be/')[1].split('?')[0];
      }
      
      const thubnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      
      await sequelize.query(
        `INSERT INTO videos (title, description, video_link, thumbnail_link, level, type, exam_type, duration, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        { replacements: [v.title, v.description, v.videolink, thubnail, 'easy', 'Speaking', 'IELTS', v.duration] }
      );
    }

    console.log(`Successfully seeded ${videos.length} speaking videos with new curriculum.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
