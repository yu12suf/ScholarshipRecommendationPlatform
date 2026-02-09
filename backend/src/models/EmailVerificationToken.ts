import { pool } from "../config/database.js";

export interface EmailVerificationToken {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export class EmailVerificationTokenModel {
  static async create(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<EmailVerificationToken> {
    const query = `
      INSERT INTO email_verification_tokens (user_id, token, expires_at, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const values = [userId, token, expiresAt];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByToken(
    token: string,
  ): Promise<EmailVerificationToken | null> {
    const query = "SELECT * FROM email_verification_tokens WHERE token = $1";
    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  }

  static async deleteByUserId(userId: number): Promise<boolean> {
    const query = "DELETE FROM email_verification_tokens WHERE user_id = $1";
    const result = await pool.query(query, [userId]);
    return (result.rowCount ?? 0) > 0;
  }

  static async deleteExpiredTokens(): Promise<void> {
    const query =
      "DELETE FROM email_verification_tokens WHERE expires_at < NOW()";
    await pool.query(query);
  }
}
