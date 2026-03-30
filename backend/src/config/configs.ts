import dotenv from "dotenv";

dotenv.config();

function setConfigs() {
    return {
        // Server Config
        NODE_ENV: process.env.NODE_ENV || "development",
        PORT: parseInt(process.env.PORT || "8080"),
        SERVER_URL: process.env.SERVER_URL || "http://localhost:",
        HOST_URL: process.env.HOST_URL,
        FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
        PRODUCTION_URL: process.env.PRODUCTION_URL,
        BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8080",

        // Database Config
        DB_HOST: process.env.DB_HOST || "localhost",
        DB_PORT: parseInt(process.env.DB_PORT || "5432"),
        DB_USER: process.env.DB_USER || "postgres",
        DB_PASSWORD: String(process.env.DB_PASSWORD || ""),
        DB_NAME: process.env.DB_NAME || "auth_system",

        // Auth Config
        JWT_SECRET: process.env.JWT_SECRET || "tempSecret",
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "refreshSecret",
        JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || process.env.JWT_EXPIRES_IN || "1d",
        JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || process.env.JWT_REFRESH_EXPIRES_IN || "7d",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,

        // Email SMTP Config
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
        SMTP_SECURE: process.env.SMTP_SECURE === "true",
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        SMTP_FROM: process.env.SMTP_FROM || `"Educational Pathway" <noreply@edu-pathway.com>`,

        // Other Configs
        QUIZ_LIMIT: process.env.QUIZ_LIMIT,
        CONTEST_LIMIT: process.env.CONTEST_LIMIT,
        CHAPA_SECRET_KEY: process.env.CHAPA_SECRET_KEY,
        CHAPA_SECRET_HASH: process.env.CHAPA_SECRET_HASH,
        MONTHLY_PRICE_IN_ETB: parseFloat(process.env.MONTHLY_PRICE_IN_ETB || "0"),
        QUARTERLY_PRICE_IN_ETB: parseFloat(process.env.QUARTERLY_PRICE_IN_ETB || "0"),
        ANNUAL_PRICE_IN_ETB: parseFloat(process.env.ANNUAL_PRICE_IN_ETB || "0"),
        SEMIANNUAL_PRICE_IN_ETB: parseFloat(process.env.SEMIANNUAL_PRICE_IN_ETB || "0"),
        MAX_CHAT_USAGE: Number(process.env.MAX_CHAT_USAGE) || 10,
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
        REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379")
    };
}

const configs = setConfigs();

export default configs;
