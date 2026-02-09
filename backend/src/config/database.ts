import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

const dbConfig: PoolConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "auth_system",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl:
        process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
};

export const pool = new Pool(dbConfig);

export const connectDB = async () => {
    try {
        await pool.connect();
        console.log("✅ PostgreSQL connected successfully");

        // Test connection
        await pool.query("SELECT NOW()");
    } catch (error) {
        console.error("❌ PostgreSQL connection error:", error);
        process.exit(1);
    }
};
