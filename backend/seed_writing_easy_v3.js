
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

    // Clear old Writing Easy IELTS videos
    await sequelize.query(`DELETE FROM videos WHERE type = 'Writing' AND level = 'easy' AND exam_type = 'IELTS'`);

    const videos = [
      // Mission 1: The Grammar Engine
      { title: "Learn Tenses in Easy Way", description: "A straightforward guide to the simple, past, and future tenses, breaking down the core foundations needed for IELTS.", videolink: "https://www.youtube.com/watch?v=yj8pdJWz4So", duration: "12:15 mins" },
      { title: "Subject Verb Agreement for IELTS", description: "A practical masterclass focusing on a crucial, basic grammar rule required for a strong score: subject-verb agreement.", videolink: "https://www.youtube.com/watch?v=UyLGHaJ8eaY", duration: "09:40 mins" },
      { title: "Present Perfect Continuous Rules", description: "Learn how to connect the past to the present, an essential tense for describing ongoing trends in Task 1.", videolink: "https://www.youtube.com/watch?v=6pB7vydwcDM", duration: "07:20 mins" },
      { title: "IELTS Grammar - Improve English", description: "An official overview from the British Council on how grammatical accuracy and range specifically affect your IELTS score.", videolink: "https://www.youtube.com/watch?v=6pB7vydwcDM", duration: "05:10 mins" },
      { title: "Master This IELTS Grammar Structure", description: "A powerful lesson on how to expand simple sentences correctly, establishing a strong grammatical foundation.", videolink: "https://www.youtube.com/watch?v=hFrkNezjU_M", duration: "08:35 mins" },
      
      // Mission 2: Sentence Architecture
      { title: "Fearless Complex Sentences", description: "An ex-examiner takes you through everything from combining clauses to avoiding common punctuation and fragment errors.", videolink: "https://www.youtube.com/watch?v=gCwD8IJlY20", duration: "15:50 mins" },
      { title: "Advanced Linking & Transitions", description: "A thorough breakdown of transition words to seamlessly join simple clauses into complex and compound ones.", videolink: "https://www.youtube.com/watch?v=4GlQMfSarmU", duration: "11:12 mins" },
      { title: "IELTS Writing Task 2 Connectors", description: "Explains all important IELTS connectors to build compound sentences naturally without sounding repetitive or robotic.", videolink: "https://www.youtube.com/watch?v=z6411BOonr8", duration: "09:25 mins" },
      { title: "Compound Conjunction Tricks", description: "Learn the grammar tricks and specific coordinating conjunctions necessary to effortlessly construct compound sentences.", videolink: "https://www.youtube.com/watch?v=Z1ZhhbgYzvw", duration: "06:45 mins" },
      { title: "Ultimate Linking Words List", description: "Master 165 connectors that are essential for linking ideas and creating cohesive, architecturally sound sentences.", videolink: "https://www.youtube.com/watch?v=LzE2WdtUvN0", duration: "13:20 mins" },
      
      // Mission 3: Describing Trends
      { title: "IELTS Task 1 Trend Vocabulary", description: "Learn the most important verbs and phrases to describe increases, decreases, and steady trends accurately.", videolink: "https://www.youtube.com/watch?v=wk8Efj6Ngr8", duration: "10:55 mins" },
      { title: "Band 9 Line Graph Guide", description: "Step-by-step guidance on choosing the right words to describe upward and downward trajectories on any line graph.", videolink: "https://www.youtube.com/watch?v=PYhnsUcappk", duration: "14:30 mins" },
      { title: "Increase, Decrease, Trend & Shift", description: "Differentiates big and small changes using exact vocabulary to stop you from repeating the same verbs over and over.", videolink: "https://www.youtube.com/watch?v=pvMHRdiU1U4", duration: "08:15 mins" },
      { title: "Graphs & Charts Adjective/Verb Dive", description: "A deep dive into essential adjectives, verbs, and adverbs specifically tailored for describing charts and tables.", videolink: "https://www.youtube.com/watch?v=NS6dtiqKFss", duration: "11:40 mins" },
      { title: "Task 1 Lexical Masterclass", description: "Comprehensive coverage of the specific lexical resources needed for making clear comparisons and reading pie charts.", videolink: "https://www.youtube.com/watch?v=3Gt58EPhTJM", duration: "12:05 mins" },
      
      // Mission 4: The 4-Paragraph Blueprint
      { title: "How Band 9 Students Write Essays", description: "A step-by-step explanation of the classic 4-paragraph structure, including the introduction, two body paragraphs, and conclusion.", videolink: "https://www.youtube.com/watch?v=G8nfBm4Vf9M", duration: "18:20 mins" },
      { title: "Step-by-Step Essay Strategy", description: "Learn how to execute a logical essay blueprint naturally, from effectively paraphrasing the prompt to a powerful conclusion.", videolink: "https://www.youtube.com/watch?v=ZcS5nyp4yA4", duration: "20:15 mins" },
      { title: "Write an Epic Essay Easily", description: "Demystifies the core essay structure, giving you a simplified roadmap that works beautifully for nearly any IELTS Task 2 prompt.", videolink: "https://www.youtube.com/watch?v=NLX7qeTmGz8", duration: "14:45 mins" },
      { title: "80 Most Common Task 2 Linkers", description: "Shows you how to tie those 4 paragraphs tightly together by using the right structural linkers and transitions.", videolink: "https://www.youtube.com/watch?v=Zdf1KYVzwdg", duration: "09:30 mins" },
      { title: "Magical Writing Tips & Templates", description: "Provides simple paragraph templates and structural advice for every major essay type you will encounter in Task 2.", videolink: "https://www.youtube.com/watch?v=rDkJWMX11p8", duration: "11:55 mins" },
      
      // Mission 5: Idea Generation
      { title: "Better & Faster Brainstorming", description: "Tricks to speed up your brainstorming process so you can get your best ideas onto paper without wasting valuable time.", videolink: "https://www.youtube.com/watch?v=1zfgugSTJrM", duration: "07:50 mins" },
      { title: "How to Generate Relevant Ideas", description: "A practical guide on how to consistently generate new and relevant ideas to support your arguments in Task 2 essays.", videolink: "https://www.youtube.com/watch?v=avqGWQi5SjE", duration: "09:15 mins" },
      { title: "Live Sample Brainstorm", description: "A live sample brainstorm that walks you through finding the pros and cons for a very common IELTS topic.", videolink: "https://www.youtube.com/watch?v=lr_3AcKx5FA", duration: "16:40 mins" },
      { title: "Guided Cause/Solution Class", description: "A guided class that walks you through generating distinct causes and solutions for environmental essay prompts.", videolink: "https://www.youtube.com/watch?v=nj2aqyr550s", duration: "14:25 mins" },
      { title: "Foundational Skills for Band 7+", description: "Covers multiple foundational skills, focusing heavily on generating, selecting, and developing the best ideas for your writing.", videolink: "https://www.youtube.com/watch?v=k5uYFbOsRbo", duration: "12:10 mins" }
    ];

    for (const v of videos) {
      const videoId = v.videolink.split('v=')[1];
      const thubnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      
      await sequelize.query(
        `INSERT INTO videos (title, description, video_link, thumbnail_link, level, type, exam_type, duration, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        { replacements: [v.title, v.description, v.videolink, thubnail, 'easy', 'Writing', 'IELTS', v.duration] }
      );
    }

    console.log(`Successfully seeded ${videos.length} writing videos with new curriculum.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
