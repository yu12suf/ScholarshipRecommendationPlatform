import { LearningPath } from "../models/LearningPath.js";
import { Video } from "../models/Video.js";
import { sequelize } from "../config/sequelize.js";

async function diagnose() {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected.");

        const paths = await LearningPath.findAll();
        console.log(`📊 Found ${paths.length} learning paths.`);
        paths.forEach(p => {
            console.log(`- Path for Student ${p.studentId}:`);
            console.log(`  Video Sections: ${JSON.stringify(p.videoSections)}`);
            console.log(`  Note Sections: ${JSON.stringify(p.noteSections)}`);
        });

        const videos = await Video.findAll();
        console.log(`🎬 Found ${videos.length} videos in DB.`);
        if (videos.length > 0) {
            console.log(`Example Video: ${JSON.stringify(videos[0])}`);
        }

    } catch (error) {
        console.error("❌ Diagnostic failed:", error);
    } finally {
        await sequelize.close();
    }
}

diagnose();
