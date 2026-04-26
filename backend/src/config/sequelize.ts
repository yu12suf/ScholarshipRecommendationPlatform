import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import {
  User,
  RefreshToken,
  PasswordResetToken,
  Student,
  Counselor,
  AvailabilitySlot,
  Payment,
  Booking,
  CounselorReview,
  Document,
  CounselorMessage,
  ScholarshipSource,
  Scholarship,
  AssessmentResult,
  Consultation,
  Notification,
  Video,
  LearningPath,
  LearningPathProgress,
  Conversation,
  ConversationParticipant,
  ChatMessage,
  TrackedScholarship,
  ScholarshipMilestone,
  VisaGuideline,
  VisaMockInterview,
  Pdf,
  CounselorPayout,
  CounselorWalletTransaction,
} from "../models/index.js";
import configs from "./configs.js";

const dbOptions: SequelizeOptions = {
  host: configs.DB_HOST,
  port: configs.DB_PORT,
  username: configs.DB_USER,
  password: configs.DB_PASSWORD,
  database: configs.DB_NAME,
  // Keep SQL logs off by default; enable only when DB_LOGGING=true.
  logging: configs.DB_LOGGING ? console.log : false,
  pool: {
    max: 10,    
    min: 0,       
    acquire: 30000,// Maximum time (ms) to try getting a connection before throwing error
    idle: 10000    // Maximum time (ms) a connection can be idle before being released
  },

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
    
};
const globalForSequelize = global as unknown as { sequelize: Sequelize };
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
    Payment,
    Booking,
    CounselorReview,
    Document,
    CounselorMessage,
    ScholarshipSource,
    Scholarship,
    AssessmentResult,
    Consultation,
    Notification,
    Video,
    LearningPath,
    LearningPathProgress,
    Conversation,
    ConversationParticipant,
    ChatMessage,
    TrackedScholarship,
    ScholarshipMilestone,
    VisaGuideline,
    VisaMockInterview,
    Pdf,
    CounselorPayout,
    CounselorWalletTransaction,
  ], // Add all models here
} as SequelizeOptions);

export let hasVectorExtension = false;

export const connectSequelize = async () => {
  try {
    await sequelize.authenticate();
    console.log("Sequelize connected successfully");

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
