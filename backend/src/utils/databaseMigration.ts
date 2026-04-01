import { sequelize } from "../config/sequelize.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { UserRepository } from "../repositories/UserRepository.js";
import { UserRole } from "../types/userTypes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createTables = async () => {
  try {
    // Read schema.sql file
    const schemaPath = path.join(__dirname, "../../database/schema.sql");

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, "utf-8");

    // Execute raw SQL through Sequelize
    await sequelize.query(schemaSql);
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
};

export const seedAdminUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    // Use UserRepository to perform the query
    await UserRepository.createIfNotExists({
      name: "Yoseph",
      email: "josefdagne5@gmail.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
      is_active: true
    });
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};

export const seedSampleUsers = async () => {
  try {
    const studentPassword = await bcrypt.hash("Student@123", 10);
    const counselorPassword = await bcrypt.hash("Counselor@123", 10);

    await UserRepository.createIfNotExists({
      name: "Sample Student",
      email: "student@example.com",
      password: studentPassword,
      role: UserRole.STUDENT,
      is_active: true
    });

    await UserRepository.createIfNotExists({
      name: "Sample Counselor",
      email: "counselor@example.com",
      password: counselorPassword,
      role: UserRole.COUNSELOR,
      is_active: true
    });

    console.log(" Sample users seeded successfully");
  } catch (error) {
    console.error("Error seeding sample users:", error);
  }
};
