import { sequelize } from "../config/sequelize.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createCommunityTables = async () => {
  try {
    const sqlPath = path.join(__dirname, "../../database/community_tables.sql");
    
    if (!fs.existsSync(sqlPath)) {
      console.log("Community SQL file not found, creating tables directly...");
      
      // Create tables directly using raw SQL
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS community_groups (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          avatar VARCHAR(500),
          type VARCHAR(20) NOT NULL DEFAULT 'group',
          privacy VARCHAR(20) NOT NULL DEFAULT 'public',
          created_by INTEGER NOT NULL,
          invite_link VARCHAR(50) UNIQUE,
          member_count INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS community_members (
          id SERIAL PRIMARY KEY,
          group_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'member',
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(group_id, user_id, status)
        );
      `);
      
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS community_messages (
          id SERIAL PRIMARY KEY,
          group_id INTEGER NOT NULL,
          sender_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          message_type VARCHAR(20) NOT NULL DEFAULT 'text',
          attachment_url VARCHAR(500),
          attachment_name VARCHAR(255),
          is_pinned BOOLEAN NOT NULL DEFAULT false,
          is_edited BOOLEAN NOT NULL DEFAULT false,
          reply_to_id INTEGER,
          reactions_count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS community_message_reactions (
          id SERIAL PRIMARY KEY,
          message_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          emoji VARCHAR(10) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(message_id, user_id, emoji)
        );
      `);
      
      console.log("Community tables created successfully!");
      return;
    }

    const sql = fs.readFileSync(sqlPath, "utf-8");
    await sequelize.query(sql);
    console.log("Community tables created from SQL file!");
  } catch (error) {
    console.error("Error creating community tables:", error);
    throw error;
  }
};

// Run if called directly
if (process.argv[1] === import.meta.url) {
  createCommunityTables()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}