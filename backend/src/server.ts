import app from "./app.js";
import { connectSequelize } from "./config/sequelize.js";
import configs from "./config/configs.js";
// import { createTables, seedAdminUser } from "./utils/databaseMigration.js"; // Migration is now handled by Sequelize sync or manual scripts

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
  } catch (err) {
    console.error("Failed to connect to database:", err);
  }
}
start();
