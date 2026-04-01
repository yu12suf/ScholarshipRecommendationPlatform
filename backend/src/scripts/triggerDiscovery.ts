import { ScholarshipDiscoveryService } from "../services/ScholarshipDiscoveryService.js";
import { sequelize } from "../config/sequelize.js";

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        console.log("Triggering discovery service...");
        await ScholarshipDiscoveryService.discoverAll();
        console.log("Discovery service finished.");

    } catch (error) {
        console.error("Error in trigger script:", error);
    } finally {
        await sequelize.close();
        console.log("Database connection closed.");
        process.exit(0);
    }
};

run();
