
// import { getConfigs } from "./config/configs";
import app from "./app.js";
import { connectSequelize } from "./config/sequelize.js";
// import { createTables, seedAdminUser } from "./utils/databaseMigration.js"; // Migration is now handled by Sequelize sync or manual scripts

async function start() {
    console.log("Initializing server...");

    // PRIORITY: Use process.env.PORT if it exists (Cloud Run sets this)
    // Otherwise use config file port, otherwise fallback to 4000
    const finalPort = process.env.PORT || 8080;

    // Start server immediately for health checks
    app.listen(Number(finalPort), "0.0.0.0", () => {
        console.log(`Server listening on port ${finalPort}`);
        console.log(`Health check available at: http://0.0.0.0:${finalPort}/health`);
    });

    // Load configurations and connect to DB asynchronously
    try {
        await connectSequelize();
        // await seedAdminUser(); // access seedAdminUser from proper service if needed
        console.log("Database ready!");
    } catch (err) {
        console.error("Failed to connect to database:", err);
    }
}
start();