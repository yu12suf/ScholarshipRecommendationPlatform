
// import { getConfigs } from "./config/configs";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import { createTables, seedAdminUser } from "./utils/databaseMigration.js";

async function start() {
    console.log("🚀 Initializing server...");

    // PRIORITY: Use process.env.PORT if it exists (Cloud Run sets this)
    // Otherwise use config file port, otherwise fallback to 4000
    const finalPort = process.env.PORT || 8080;

    // Start server immediately for health checks
    app.listen(Number(finalPort), "0.0.0.0", () => {
        console.log(`🚀 Server listening on port ${finalPort}`);
        console.log(`📍 Health check available at: http://0.0.0.0:${finalPort}/health`);
    });

    // Load configurations and connect to DB asynchronously
    try {
        await connectDB();

        // Run database migrations and seeding
        await createTables();
        await seedAdminUser();
    } catch (err) {
        console.error("Failed to connect to database or run migrations:", err);
    }
}
start();