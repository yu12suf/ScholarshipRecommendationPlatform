import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { PasswordResetToken } from "../models/PasswordResetToken.js";
import { Student } from "../models/Student.js";
import { Counselor } from "../models/Counselor.js";
import configs from "./configs.js";

// Determine connection options based on environment
const dbOptions: SequelizeOptions = {
    host: configs.DB_HOST,
    port: configs.DB_PORT,
    username: configs.DB_USER,
    password: configs.DB_PASSWORD,
    database: configs.DB_NAME,
    logging: false, // Set to console.log to see SQL queries

    // Handle SSL for production
    dialectOptions: configs.NODE_ENV === "production"
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
    timezone: "+00:00", // Force UTC to avoid timezone issues
    models: [User, RefreshToken, PasswordResetToken, Student, Counselor], // Add all models here
} as SequelizeOptions);

export const connectSequelize = async () => {
    try {
        await sequelize.authenticate();
        console.log("Sequelize connected successfully");


    } catch (error) {
        console.error("Sequelize connection error:", error);
        process.exit(1);
    }
};
