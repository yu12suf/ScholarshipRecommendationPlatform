import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { PasswordResetToken } from "../models/PasswordResetToken.js";
import { Student } from "../models/Student.js";
import { Counselor } from "../models/Counselor.js";
import { AvailabilitySlot } from "../models/AvailabilitySlot.js";
import { Booking } from "../models/Booking.js";
import { CounselorReview } from "../models/CounselorReview.js";
import { ScholarshipSource } from "../models/ScholarshipSource.js";
import { Scholarship } from "../models/Scholarship.js";
import configs from "./configs.js";

console.log('DB_PASSWORD from env:', process.env.DB_PASSWORD ? '****' : 'NOT SET');

const dbOptions: SequelizeOptions = {
    host: configs.DB_HOST,
    port: configs.DB_PORT,
    username: configs.DB_USER,
    password: configs.DB_PASSWORD,
    database: configs.DB_NAME,
    logging: console.log, // Set to console.log to see SQL queries

    dialectOptions: {
        // Force the connection to use UTC for all date/time operations
        timezone: 'UTC',

        // Handle SSL only in production
        ...(configs.NODE_ENV === "production" ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {})
    } as any, // Cast to any to satisfy TypeScript, as dialectOptions can be driver-specific
};

export const sequelize = new Sequelize({
    dialect: "postgres",
    ...dbOptions,
    timezone: "+00:00", // Force UTC to avoid timezone issues
    models: [
        User,
        RefreshToken,
        PasswordResetToken,
        Student,
        Counselor,
        AvailabilitySlot,
        Booking,
        CounselorReview,
        ScholarshipSource,
        Scholarship
    ],
} as SequelizeOptions);

export const connectSequelize = async () => {
    try {
        await sequelize.authenticate();
        console.log("Sequelize connected successfully");

        // Sync models with database (creates tables if missing)
        // Note: In production, migrations are preferred.
        await sequelize.sync({ alter: true });
        console.log("Database models synchronized");

    } catch (error) {
        console.error("Sequelize connection error:", error);
        process.exit(1);
    }
};