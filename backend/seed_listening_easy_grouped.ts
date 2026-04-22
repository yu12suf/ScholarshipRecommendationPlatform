
import { sequelize } from './src/config/sequelize.ts';
import { Video } from './src/models/Video.ts';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Clear old Listening Easy IELTS videos to ensure order
    await Video.destroy({
      where: {
        type: 'Listening',
        level: 'easy',
        examType: 'IELTS'
      }
    });

    const videos = [
      // Mission 1: Precision Hearing
      { videolink: "https://www.youtube.com/watch?v=sYG-BKgV678", thubnail: "https://img.youtube.com/vi/sYG-BKgV678/hqdefault.jpg" },
      { videolink: "https://www.youtube.com/watch?v=o7O4oQqWA1M", thubnail: "https://img.youtube.com/vi/o7O4oQqWA1M/hqdefault.jpg" },
      { videolink: "https://www.youtube.com/watch?v=MgWfkrMOhV0", thubnail: "https://img.youtube.com/vi/MgWfkrMOhV0/hqdefault.jpg" },
      { videolink: "https://www.youtube.com/watch?v=UKdZALEoa4o", thubnail: "https://img.youtube.com/vi/UKdZALEoa4o/hqdefault.jpg" },
      { videolink: "https://www.youtube.com/watch?v=HYp08TMG5uw", thubnail: "https://img.youtube.com/vi/HYp08TMG5uw/hqdefault.jpg" },
      // Mission 2: Situational Tracking
      { videolink: "https://www.youtube.com/watch?v=ph1EFfHpMX8", thubnail: "https://img.youtube.com/vi/ph1EFfHpMX8/hqdefault.jpg" },
      { videolink: "https://www.youtube.com/watch?v=OjLzrpCq__U", thubnail: "https://img.youtube.com/vi/OjLzrpCq__U/hqdefault.jpg" },
      { videolink: "https://www.youtube.com/watch?v=G-Yb4psq0h0", thubnail: "https://img.youtube.com/vi/G-Yb4psq0h0/hqdefault.jpg" },
      { videolink: "https://www.youtube.com/watch?v=l1LKp-q9k50", thubnail: "https://img.youtube.com/vi/l1LKp-q9k50/hqdefault.jpg" },
      { videolink: "https://www.youtube.com/watch?v=3FyVV4p-Oxw", thubnail: "https://img.youtube.com/vi/3FyVV4p-Oxw/hqdefault.jpg" },
      // Mission 3: The Echo Trap
      { videolink: "https://www.youtube.com/watch?v=hOAsUNNyPIs", thubnail: "https://img.youtube.com/vi/hOAsUNNyPIs/hqdefault.jpg" },
      { videolink: "https://www.youtube.com/watch?v=i1vqbto3C_E", thubnail: "https://img.youtube.com/vi/i1vqbto3C_E/hqdefault.jpg" },
      { videolink: "https://www.youtube.com/watch?v=YWdVk4MKZ4I", thubnail: "https://img.youtube.com/vi/YWdVk4MKZ4I/hqdefault.jpg" },
      { videolink: "https://www.youtube.com/watch?v=VSteuEhXQqY", thubnail: "https://img.youtube.com/vi/VSteuEhXQqY/hqdefault.jpg" },
      { videolink: "https://www.youtube.com/watch?v=wR1e-j_ZbNs", thubnail: "https://img.youtube.com/vi/wR1e-j_ZbNs/hqdefault.jpg" }
    ];

    for (const v of videos) {
      await Video.create({
        ...v,
        type: 'Listening',
        level: 'easy',
        examType: 'IELTS'
      });
    }

    console.log(`Successfully seeded ${videos.length} listening videos.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
