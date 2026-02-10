import { User } from "../models/User.js";
import { UserRole } from "../types/userTypes.js";
export class UserRepository {
    static async create(userData) {
        const { name, email, password, googleId, role = UserRole.STUDENT } = userData;
        const user = await User.create({
            name,
            email,
            password,
            googleId,
            role,
        });
        return user;
    }
    static async createIfNotExists(userData) {
        const { name, email, password, role = UserRole.STUDENT, is_active = true, } = userData;
        await User.findOrCreate({
            where: { email },
            defaults: {
                name,
                password,
                role,
                isActive: is_active,
            }
        });
    }
    static async findByEmail(email) {
        return User.findOne({ where: { email } });
    }
    static async findByGoogleId(googleId) {
        return User.findOne({ where: { googleId } });
    }
    static async findById(id) {
        return User.findByPk(id);
    }
    static async findByName(name) {
        return User.findOne({ where: { name } });
    }
    static async update(id, updates) {
        // Filter out undefined values
        const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
        if (Object.keys(cleanUpdates).length === 0)
            return null;
        const [updatedRows, [updatedUser]] = await User.update(cleanUpdates, {
            where: { id },
            returning: true,
        });
        return updatedRows > 0 && updatedUser ? updatedUser : null;
    }
    static async updatePassword(id, password) {
        const [updatedRows] = await User.update({ password }, {
            where: { id }
        });
        return updatedRows > 0;
    }
    static async delete(id) {
        const deletedRows = await User.destroy({
            where: { id }
        });
        return deletedRows > 0;
    }
    static async findAll(limit = 10, offset = 0) {
        return User.findAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
    }
    static async findByRole(role, limit = 10, offset = 0) {
        return User.findAll({
            where: { role },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
    }
}
//# sourceMappingURL=UserRepository.js.map