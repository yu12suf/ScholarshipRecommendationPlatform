import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import * as Models from "../models/index.js";
import { initAssociations } from "../models/associations.js";
import configs from "./configs.js";

console.log('DB_PASSWORD from env:', process.env.DB_PASSWORD ? '****' : 'NOT SET');

const dbOptions: SequelizeOptions = {
  host: configs.DB_HOST,
  port: configs.DB_PORT,
  username: configs.DB_USER,
  password: configs.DB_PASSWORD,
  database: configs.DB_NAME,
  logging: console.log, // Set to false to silence SQL queries

  // Handle SSL for production
  dialectOptions:
    configs.NODE_ENV === "production"
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : (undefined as any),
};

export const sequelize = new Sequelize({
  dialect: "postgres",
  ...dbOptions,
  timezone: "+00:00", // Force UTC to avoid timezone issues
  models: Object.values(Models).filter((m) => m && typeof m === 'function' && m.name),
} as SequelizeOptions);

export let hasVectorExtension = false;

export const connectSequelize = async () => {
  try {
    await sequelize.authenticate();
    console.log("Sequelize connected successfully");

    // Initialize associations after all models are loaded
    initAssociations();
    console.log("Model associations initialized");

    // Enable pgvector extension
    try {
      await sequelize.query("CREATE EXTENSION IF NOT EXISTS vector;");
      console.log("pgvector extension ensured");
      hasVectorExtension = true;
    } catch (extensionError) {
      console.warn(
        "⚠️ Warning: Failed to enable pgvector extension. Ensure it is installed on your PostgreSQL system.",
      );
      hasVectorExtension = false;
    }

    // Sync models with database (creates tables if missing)
    // Note: In production, migrations are preferred.
    await sequelize.sync({ alter: true });
    console.log("Database models synchronized");
  } catch (error) {
    console.error("Sequelize connection error:", error);
    process.exit(1);
  }
};
