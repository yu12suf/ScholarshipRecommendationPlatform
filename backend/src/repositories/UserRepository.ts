
import { pool } from "../config/database.js";
import { User, CreateUserDto, UpdateUserDto, UserRole } from "../types/userTypes.js";

export class UserRepository {
    static async create(userData: CreateUserDto): Promise<User> {
        const { name, email, password, role = UserRole.STUDENT } = userData;
        const query = `
      INSERT INTO users (name, email, password, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
        const values = [name, email, password, role];

        const result = await pool.query(query, values);
        return this.toDomain(result.rows[0]);
    }

    static async createIfNotExists(
        userData: CreateUserDto & { is_active?: boolean },
    ): Promise<void> {
        const {
            name,
            email,
            password,
            role = UserRole.STUDENT,
            is_active = true,
        } = userData;
        const query = `
      INSERT INTO users (name, email, password, role, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `;
        const values = [
            name,
            email,
            password,
            role,
            is_active,
        ];

        await pool.query(query, values);
    }

    static async findByEmail(email: string): Promise<User | null> {
        const query = "SELECT * FROM users WHERE email = $1";
        const result = await pool.query(query, [email]);
        return result.rows[0] ? this.toDomain(result.rows[0]) : null;
    }

    static async findById(id: number): Promise<User | null> {
        const query = "SELECT * FROM users WHERE id = $1";
        const result = await pool.query(query, [id]);
        return result.rows[0] ? this.toDomain(result.rows[0]) : null;
    }

    static async findByName(name: string): Promise<User | null> {
        const query = "SELECT * FROM users WHERE name = $1";
        const result = await pool.query(query, [name]);
        return result.rows[0] ? this.toDomain(result.rows[0]) : null;
    }

    static async update(
        id: number,
        updates: UpdateUserDto,
    ): Promise<User | null> {
        const fields = Object.keys(updates);
        if (fields.length === 0) return null;

        const fieldMap: Record<string, string> = {
            isActive: 'is_active',
            name: 'name',
            email: 'email',
            role: 'role'
        };

        const setClause = fields
            .map((field, index) => {
                const dbField = fieldMap[field] || field;
                return `${dbField} = $${index + 2}`;
            })
            .join(", ");

        // Check if any valid fields are being updated
        if (!setClause) return null;

        const query = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
        const values = [id, ...Object.values(updates)];

        const result = await pool.query(query, values);
        return result.rows[0] ? this.toDomain(result.rows[0]) : null;
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
        return result.rows.map((row) => this.toDomain(row));
    }

    static async findByRole(
        role: UserRole,
        limit = 10,
        offset = 0,
    ): Promise<User[]> {
        const query =
            "SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3";
        const result = await pool.query(query, [role, limit, offset]);
        return result.rows.map((row) => this.toDomain(row));
    }

    private static toDomain(row: any): User {
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            password: row.password,
            role: row.role as UserRole,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
