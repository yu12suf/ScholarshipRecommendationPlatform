import { sequelize } from "../src/config/sequelize.js";

async function run() {
  try {
    await sequelize.authenticate();

    await sequelize.query("ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;");
    await sequelize.query(`
      ALTER TABLE bookings
      ADD CONSTRAINT bookings_status_check
      CHECK (
        status IN (
          'pending',
          'confirmed',
          'started',
          'awaiting_confirmation',
          'completed',
          'cancelled',
          'disputed'
        )
      );
    `);

    console.log("CHECK_CONSTRAINT_UPDATED");
  } catch (error) {
    console.error("FAILED_TO_UPDATE_CHECK", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
