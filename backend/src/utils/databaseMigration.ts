
import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { UserRepository } from "../repositories/UserRepository.js";
import { UserRole } from "../types/userTypes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createTables = async () => {
  const client = await pool.connect();

  try {
    // Read schema.sql file
    // Adjusted path: src/utils/ -> ../../database/schema.sql
    const schemaPath = path.join(__dirname, "../../database/schema.sql");

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, "utf-8");

    await client.query("BEGIN");
    await client.query(schemaSql);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating tables:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const seedAdminUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    // Use UserRepository to perform the query
    await UserRepository.createIfNotExists({
      username: "Yoseph",
      email: "josefdagne5@gmail.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
      email_verified: true,
      is_active: true
    });
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};
