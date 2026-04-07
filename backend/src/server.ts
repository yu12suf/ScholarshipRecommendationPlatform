import app from "./app.js";
import http from "http";
import { connectSequelize } from "./config/sequelize.js";
import configs from "./config/configs.js";
import { SocketService } from "./services/SocketService.js";
// import { createTables, seedAdminUser } from "./utils/databaseMigration.js"; // Migration is now handled by Sequelize sync or manual scripts

// Scholarship automation imports
import { startScholarshipCron } from "./automation/scholarshipCron.js";
import { assessmentWorker } from "./workers/AssessmentWorker.js";
import { seedScholarshipSources } from "./scripts/seedScholarships.js";

// Temporary: Global unhandled rejection handler for debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function start() {
  console.log("Initializing server...");

  // PRIORITY: Use configs.PORT
  const finalPort = configs.PORT;

  // Start server immediately for health checks
  const server = http.createServer(app);
  
  // Initialize Socket.io
  SocketService.initialize(server);

  server.listen(Number(finalPort), '0.0.0.0', () => {
    console.log(`Server listening on port ${finalPort}`);
    console.log(
      `Health check available at: http://0.0.0.0:${finalPort}/health`,
    );
  });

  // Load configurations and connect to DB asynchronously
  try {
    await connectSequelize();

    // Ensure the assessment worker is running (explicit reference prevents tree-shaking)
    if (assessmentWorker) {
        console.log(`🧠 Assessment worker started: ${assessmentWorker.name}`);
    } else {
        console.warn("⚠️ Assessment worker skipped (Redis not connected)");
    }

    // Initialize Scholarship Ingestion System
    // await seedScholarshipSources();
    // startScholarshipCron();

  } catch (err) {
    console.error("Failed to connect to database:", err);
  }
}
start();