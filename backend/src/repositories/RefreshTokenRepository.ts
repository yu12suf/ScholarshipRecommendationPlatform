
import { pool } from "../config/database.js";
import { RefreshToken } from "../types/authTypes.js";

export class RefreshTokenRepository {
    static async create(
        userId: number,
        token: string,
        expiresAt: Date,
    ): Promise<RefreshToken> {
        const query = `
      INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
        const values = [userId, token, expiresAt];

        const result = await pool.query(query, values);
        return this.toDomain(result.rows[0]);
    }

    static async findByToken(token: string): Promise<RefreshToken | null> {
        const query = "SELECT * FROM refresh_tokens WHERE token = $1";
        const result = await pool.query(query, [token]);
        return result.rows[0] ? this.toDomain(result.rows[0]) : null;
    }

    static async findByUserId(userId: number): Promise<RefreshToken[]> {
        const query =
            "SELECT * FROM refresh_tokens WHERE user_id = $1 ORDER BY created_at DESC";
        const result = await pool.query(query, [userId]);
        return result.rows.map((row) => this.toDomain(row));
    }

    static async deleteByToken(token: string): Promise<boolean> {
        const query = "DELETE FROM refresh_tokens WHERE token = $1";
        const result = await pool.query(query, [token]);
        return (result.rowCount ?? 0) > 0;
    }

    static async deleteByUserId(userId: number): Promise<boolean> {
        const query = "DELETE FROM refresh_tokens WHERE user_id = $1";
        const result = await pool.query(query, [userId]);
        return (result.rowCount ?? 0) > 0;
    }

    static async deleteExpiredTokens(): Promise<void> {
        const query = "DELETE FROM refresh_tokens WHERE expires_at < NOW()";
        await pool.query(query);
    }

    private static toDomain(row: any): RefreshToken {
        return {
            id: row.id,
            userId: row.user_id,
            token: row.token,
            expiresAt: row.expires_at,
            createdAt: row.created_at,
        };
    }
}
