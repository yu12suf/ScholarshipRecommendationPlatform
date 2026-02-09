
import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";

export const createTables = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'student' 
          CHECK (role IN ('student', 'counselor', 'admin')),
        is_active BOOLEAN NOT NULL DEFAULT true,
        email_verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create refresh_tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create password_reset_tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create email_verification_tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
    `);

    // Create function to update updated_at timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger for users table
    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    `);

    await client.query(`
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query("COMMIT");
    console.log("Tables created successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating tables:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const seedAdminUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await pool.query(
      `
      INSERT INTO users (username, email, password, role, email_verified, is_active)
      VALUES ('admin', 'admin@example.com', $1, 'admin', true, true)
      ON CONFLICT (email) DO NOTHING
    `,
      [hashedPassword],
    );

    console.log("Admin user seeded (if not exists)");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};

export const seedSampleUsers = async () => {
  try {
    // Sample counselor
    const counselorPassword = await bcrypt.hash("Counselor@123", 10);
    await pool.query(
      `
      INSERT INTO users (username, email, password, role, email_verified, is_active)
      VALUES ('counselor1', 'counselor@example.com', $1, 'counselor', true, true)
      ON CONFLICT (email) DO NOTHING
    `,
      [counselorPassword],
    );

    // Sample student
    const studentPassword = await bcrypt.hash("Student@123", 10);
    await pool.query(
      `
      INSERT INTO users (username, email, password, role, email_verified, is_active)
      VALUES ('student1', 'student@example.com', $1, 'student', true, true)
      ON CONFLICT (email) DO NOTHING
    `,
      [studentPassword],
    );

    console.log("Sample users seeded (if not exists)");
  } catch (error) {
    console.error("Error seeding sample users:", error);
  }
};
