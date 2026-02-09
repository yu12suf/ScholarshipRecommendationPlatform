import { pool } from "../config/database.js";
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserRole,
} from "../types/userTypes.js";

export class UserModel {
  static async create(userData: CreateUserDto): Promise<User> {
    const { username, email, password, role = UserRole.STUDENT } = userData;
    const query = `
      INSERT INTO users (username, email, password, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    const values = [username, email, password, role];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  static async update(
    id: number,
    updates: UpdateUserDto,
  ): Promise<User | null> {
    const fields = Object.keys(updates);
    if (fields.length === 0) return null;

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const values = [id, ...Object.values(updates)];

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async updatePassword(id: number, password: string): Promise<boolean> {
    const query =
      "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2";
    const result = await pool.query(query, [password, id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const query = "DELETE FROM users WHERE id = $1";
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async findAll(limit = 10, offset = 0): Promise<User[]> {
    const query =
      "SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2";
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async findByRole(
    role: UserRole,
    limit = 10,
    offset = 0,
  ): Promise<User[]> {
    const query =
      "SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3";
    const result = await pool.query(query, [role, limit, offset]);
    return result.rows;
  }
}
