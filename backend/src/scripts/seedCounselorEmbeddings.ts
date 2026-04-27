import { Counselor } from "../models/Counselor.js";
import { VectorService } from "../services/VectorService.js";
import { sequelize, connectSequelize } from "../config/sequelize.js";
import { User } from "../models/User.js";

async function seed() {
    try {
        console.log("Starting counselor embedding seeding...");
        
        await connectSequelize();
        
        const counselors = await Counselor.findAll({
            where: { verificationStatus: 'verified', isActive: true },
            include: [{ model: User, as: "user" }]
        });

        console.log(`Found ${counselors.length} verified counselors to process.`);

        for (const counselor of counselors) {
            try {
                console.log(`Processing counselor: ${counselor.user?.name || counselor.id}...`);
                await VectorService.generateCounselorEmbedding(counselor);
                console.log(`✅ Success for ${counselor.id}`);
            } catch (err) {
                console.error(`❌ Failed for ${counselor.id}:`, err);
            }
        }

        console.log("Seeding completed.");
        process.exit(0);
    } catch (error) {
        console.error("Critical error during seeding:", error);
        process.exit(1);
    }
}

seed();
