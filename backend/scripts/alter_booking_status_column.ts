import { sequelize } from "../src/config/sequelize.js";

async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.query("ALTER TABLE bookings ALTER COLUMN status TYPE VARCHAR(32);");
    console.log("ALTER_OK");
  } catch (error) {
    console.error("ALTER_FAILED", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
