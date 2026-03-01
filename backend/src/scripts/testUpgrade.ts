
import { ScholarshipDiscoveryService } from '../services/ScholarshipDiscoveryService.js';
import { ScholarshipSourceRepository } from '../repositories/ScholarshipSourceRepository.js';
import { sequelize } from '../config/sequelize.js';

async function testUpgrade() {
    console.log("Starting verification of upgraded ingestion engine...");

    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        // We can manually trigger discoverAll or specific methods
        // Since discoverAll launches a browser and crawls, we'll try a small-scale run

        // 1. Check if we can find active sources
        const sources = await ScholarshipSourceRepository.findAllActive();
        console.log(`Found ${sources.length} active sources.`);

        if (sources.length > 0) {
            console.log("Triggering discovery for 1 source to verify flow...");
            // We'll just run discoverAll which now has concurrency and adaptive strategies
            await ScholarshipDiscoveryService.discoverAll();
        } else {
            console.log("No active sources found. Please add a source to verify.");
        }

    } catch (error) {
        console.error("Verification failed:", error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

testUpgrade();
