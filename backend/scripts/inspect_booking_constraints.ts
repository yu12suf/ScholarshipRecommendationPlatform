import { sequelize } from "../src/config/sequelize.js";

async function run() {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(`
      SELECT c.conname, pg_get_constraintdef(c.oid) AS definition
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      WHERE t.relname = 'bookings' AND c.contype = 'c'
      ORDER BY c.conname;
    `);
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error("FAILED", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

run();
