import { pool } from "../config/database.js";

export interface PasswordResetToken {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export class PasswordResetTokenModel {
  static async create(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<PasswordResetToken> {
    const query = `
      INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const values = [userId, token, expiresAt];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByToken(token: string): Promise<PasswordResetToken | null> {
    const query = "SELECT * FROM password_reset_tokens WHERE token = $1";
    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  }

  static async markAsUsed(token: string): Promise<boolean> {
    const query =
      "UPDATE password_reset_tokens SET used = true WHERE token = $1";
    const result = await pool.query(query, [token]);
    return (result.rowCount ?? 0) > 0;
  }

  static async deleteByUserId(userId: number): Promise<boolean> {
    const query = "DELETE FROM password_reset_tokens WHERE user_id = $1";
    const result = await pool.query(query, [userId]);
    return (result.rowCount ?? 0) > 0;
  }

  static async deleteExpiredTokens(): Promise<void> {
    const query = "DELETE FROM password_reset_tokens WHERE expires_at < NOW()";
    await pool.query(query);
  }
}
