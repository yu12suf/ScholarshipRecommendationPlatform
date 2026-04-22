import { sequelize } from "../src/config/sequelize.js";
import { VisaMockInterview } from "../src/models/index.js";

async function clean() {
  await sequelize.authenticate();
  console.log("Connected to database...");
  
  const interviews = await VisaMockInterview.findAll();
  let deleted = 0;

  for (const interview of interviews) {
    let shouldDelete = false;

    // Check for 0 score
    if (interview.aiEvaluation && typeof interview.aiEvaluation === 'object' && interview.aiEvaluation.score) {
      if (String(interview.aiEvaluation.score).startsWith("0")) {
        shouldDelete = true;
      }
    }

    // Check for failed status
    if (interview.status === "Failed" || interview.status === "Pending") {
      shouldDelete = true;
    }

    if (shouldDelete) {
      console.log(`Deleting interview ID: ${interview.id}`);
      await interview.destroy();
      deleted++;
    }
  }

  console.log(`\nSuccessfully deleted ${deleted} empty/failed interviews.`);
  process.exit(0);
}

clean().catch(err => {
  console.error(err);
  process.exit(1);
});
