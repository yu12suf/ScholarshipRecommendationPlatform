import app from "./app.js";
import { connectSequelize } from "./config/sequelize.js";
import configs from "./config/configs.js";
// import { createTables, seedAdminUser } from "./utils/databaseMigration.js"; // Migration is now handled by Sequelize sync or manual scripts

// Scholarship automation imports
import { startScholarshipCron } from "./automation/scholarshipCron.js";
 import { assessmentWorker } from "./workers/AssessmentWorker.js";
import { seedScholarshipSources } from "./scripts/seedScholarships.js";
import { seedTestData } from "./scripts/seedsampleactuallscholarship.js";

// Temporary: Global unhandled rejection handler for debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function start() {
  console.log("Initializing server...");

  // PRIORITY: Use configs.PORT
  const finalPort = configs.PORT;

  // Start server immediately for health checks
  app.listen(Number(finalPort), "0.0.0.0", () => {
    console.log(`Server listening on port ${finalPort}`);
    console.log(
      `Health check available at: http://0.0.0.0:${finalPort}/health`,
    );
  });

  // Load configurations and connect to DB asynchronously
  try {
    await connectSequelize();

    // Ensure the assessment worker is running (explicit reference prevents tree-shaking)
    console.log(`🧠 Assessment worker started: ${assessmentWorker.name}`);

    // Initialize Scholarship Ingestion System
    // await seedScholarshipSources();
    // startScholarshipCron();
    // seedTestData();

  } catch (err) {
    console.error("Failed to connect to database:", err);
  }
}
start();