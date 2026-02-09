

// import { getConfigs } from "./config/configs";
import app from "./app.js";
import { connectDB } from "./config/database.js";

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
    } catch (err) {
        console.error("Failed to connect to database:", err);
    }
}
start();