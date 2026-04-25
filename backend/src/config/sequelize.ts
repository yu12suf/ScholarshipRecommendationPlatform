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
  CommunityGroup,
  CommunityMember,
  CommunityMessage,
  MessageReaction,
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
    CommunityGroup,
    CommunityMember,
    CommunityMessage,
    MessageReaction,
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

    // Sync models with database (creates tables/columns if missing, does not alter existing columns)
    // Skipping - tables created via migrations; uncomment if needed for fresh DB
    // await sequelize.sync();
    console.log("Database models synchronized (skipped - using migrations)");

    // Helper: add column if not exists
    const addColumnIfNotExists = async (table: string, column: string, columnType: string, defaultValue: string, defaultValueType?: string) => {
      const colCheck = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = '${column}'
        );
      `);
      const columnExists = (colCheck[0] as any)[0].exists;
      if (!columnExists) {
        console.log(`Adding column ${table}.${column}`);
        const defVal = defaultValueType ? `DEFAULT '${defaultValue}'::${defaultValueType}` : `DEFAULT '${defaultValue}'`;
        await sequelize.query(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${columnType} ${defVal} NOT NULL;`);
      } else {
        console.log(`Column ${table}.${column} already exists`);
      }
    };

    // Helper: migrate column to enum safely
    const migrateToEnum = async (table: string, column: string, enumName: string, enumValues: string[], defaultValue: string) => {
      // Check if column exists first
      const colCheck = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = '${column}'
        );
      `);
      const columnExists = (colCheck[0] as any)[0].exists;
      if (!columnExists) {
        console.log(`Skipping enum migration: column ${table}.${column} does not exist yet`);
        return;
      }

      const typeName = `enum_${enumName}`;
      const fullTypeName = `public.${typeName}`;
      const enumList = enumValues.map(v => `'${v}'`).join(', ');

      // Step 1: Drop default if it exists (ignore errors)
      await sequelize.query(`
        DO $$ 
        BEGIN
          ALTER TABLE "${table}" ALTER COLUMN "${column}" DROP DEFAULT;
        EXCEPTION
          WHEN OTHERS THEN NULL;
        END $$;
      `);

      // Step 2: Create enum type if not exists
      await sequelize.query(`
        DO $$ 
        BEGIN
          CREATE TYPE ${fullTypeName} AS ENUM(${enumList});
        EXCEPTION
          WHEN duplicate_object THEN NULL;
        END $$;
      `);

      // Step 3: Alter column to use the enum type
      await sequelize.query(`
        ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE ${fullTypeName} USING ("${column}"::text::${fullTypeName});
      `);

      // Step 4: Set default with proper enum cast
      await sequelize.query(`
        ALTER TABLE "${table}" ALTER COLUMN "${column}" SET DEFAULT '${defaultValue}'::${fullTypeName};
      `);

      // Step 5: Set NOT NULL constraint
      await sequelize.query(`
        ALTER TABLE "${table}" ALTER COLUMN "${column}" SET NOT NULL;
      `);
    };

    // Add missing columns if they don't exist
    await addColumnIfNotExists('community_messages', 'message_type', 'VARCHAR(50)', 'text');
    await addColumnIfNotExists('community_groups', 'type', 'VARCHAR(50)', 'group');
    await addColumnIfNotExists('community_members', 'role', 'VARCHAR(50)', 'member');

    // Migrate community_groups columns
    try {
      await migrateToEnum('community_groups', 'type', 'community_groups_type', ['group', 'channel'], 'group');
      await migrateToEnum('community_groups', 'privacy', 'community_groups_privacy', ['public', 'private'], 'public');
      await migrateToEnum('community_groups', 'add_members_permission', 'community_groups_add_members_permission', ['admin', 'all'], 'admin');
      console.log("Community groups enum migrations completed");
    } catch (e: any) {
      console.warn("⚠️ Warning: Community groups enum migration failed:", e.message);
    }

    // Migrate community_members columns
    try {
      await migrateToEnum('community_members', 'role', 'community_members_role', ['admin', 'moderator', 'member'], 'member');
      await migrateToEnum('community_members', 'status', 'community_members_status', ['active', 'left', 'removed'], 'active');
      console.log("Community members enum migrations completed");
    } catch (e: any) {
      console.warn("⚠️ Warning: Community members enum migration failed:", e.message);
    }

    // Migrate community_messages columns
    try {
      await migrateToEnum('community_messages', 'message_type', 'community_messages_message_type', ['text', 'image', 'file', 'link'], 'text');
      console.log("Community messages enum migrations completed");
    } catch (e: any) {
      console.warn("⚠️ Warning: Community messages enum migration failed:", e.message);
    }
  } catch (error) {
    console.error("Sequelize connection error:", error);
    process.exit(1);
  }
};
