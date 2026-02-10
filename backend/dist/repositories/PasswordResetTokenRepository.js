import { pool } from "../config/database.js";
export class PasswordResetTokenRepository {
    static async create(userId, token, expiresAt) {
        const query = `
      INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
        const values = [userId, token, expiresAt];
        const result = await pool.query(query, values);
        return this.toDomain(result.rows[0]);
    }
    static async findByToken(token) {
        const query = "SELECT * FROM password_reset_tokens WHERE token = $1";
        const result = await pool.query(query, [token]);
        return result.rows[0] ? this.toDomain(result.rows[0]) : null;
    }
    static async markAsUsed(token) {
        const query = "UPDATE password_reset_tokens SET used = true WHERE token = $1";
        const result = await pool.query(query, [token]);
        return (result.rowCount ?? 0) > 0;
    }
    static async deleteByUserId(userId) {
        const query = "DELETE FROM password_reset_tokens WHERE user_id = $1";
        const result = await pool.query(query, [userId]);
        return (result.rowCount ?? 0) > 0;
    }
    static async deleteExpiredTokens() {
        const query = "DELETE FROM password_reset_tokens WHERE expires_at < NOW()";
        await pool.query(query);
    }
    static toDomain(row) {
        return {
            id: row.id,
            userId: row.user_id,
            token: row.token,
            expiresAt: row.expires_at,
            used: row.used,
            createdAt: row.created_at,
        };
    }
}
//# sourceMappingURL=PasswordResetTokenRepository.js.map