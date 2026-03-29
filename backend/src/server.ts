import app from "./app.js";
import { connectSequelize } from "./config/sequelize.js";
import configs from "./config/configs.js";
import { createServer } from "http";
import { SocketService } from "./services/SocketService.js";

import { startScholarshipCron } from "./automation/scholarshipCron.js";
import { assessmentWorker } from "./workers/AssessmentWorker.js";
import { seedScholarshipSources } from "./scripts/seedScholarships.js";
import { seedTestData } from "./scripts/seedsampleactuallscholarship.js";

async function start() {
  console.log("Initializing server...");

  const finalPort = configs.PORT;
  const httpServer = createServer(app);

  // Initialize Socket.IO
  SocketService.initialize(httpServer);

  httpServer.listen(Number(finalPort), () => {
    console.log(`Server listening on port ${finalPort}`);
    console.log(`Health check available at: http://0.0.0.0:${finalPort}/health`);
  });

  try {
    await connectSequelize();
    console.log(`🧠 Assessment worker initialized: ${assessmentWorker.name}`);
  } catch (err) {
    console.error("Failed to connect to database:", err);
  }
}
start();
