import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import dotenv from "dotenv";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { PasswordResetToken } from "../models/PasswordResetToken.js";

dotenv.config();

// Determine connection options based on environment
const dbOptions: SequelizeOptions = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "auth_system",
    logging: false, // Set to console.log to see SQL queries

    // Handle SSL for production
    dialectOptions: process.env.NODE_ENV === "production"
        ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
        : undefined as any,
};

export const sequelize = new Sequelize({
    dialect: "postgres",
    ...dbOptions,
    models: [User, RefreshToken, PasswordResetToken], // Add all models here
} as SequelizeOptions);

export const connectSequelize = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Sequelize connected successfully");

        // Sync models with database (alter: true updates tables if they exist)
        // Be careful with alter: true in production!
        // await sequelize.sync({ alter: true }); 
        // console.log("✅ Models synchronized");

    } catch (error) {
        console.error("❌ Sequelize connection error:", error);
        process.exit(1);
    }
};
