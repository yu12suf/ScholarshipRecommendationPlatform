import { User } from "../models/User.js";
import { Consultation } from "../models/Consultation.js";
import { CreateUserDto, UpdateUserDto, UserRole } from "../types/userTypes.js";

export class UserRepository {
    static async create(userData: CreateUserDto): Promise<User> {
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

        await User.findOrCreate({
            where: { email },
            defaults: {
                name,
                password,
                role,
                isActive: is_active,
            } as any
        });
    }

    static async findByEmail(email: string): Promise<User | null> {
        return User.findOne({ where: { email } });
    }

    static async findByGoogleId(googleId: string): Promise<User | null> {
        return User.findOne({ where: { googleId } });
    }

    static async findById(id: number): Promise<User | null> {
        return User.findByPk(id);
    }

    static async findByName(name: string): Promise<User | null> {
        return User.findOne({ where: { name } });
    }

    static async update(
        id: number,
        updates: UpdateUserDto,
    ): Promise<User | null> {
        // Filter out undefined values
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        if (Object.keys(cleanUpdates).length === 0) return null;

        const [updatedRows, [updatedUser]] = await User.update(cleanUpdates, {
            where: { id },
            returning: true,
        });

        return updatedRows > 0 && updatedUser ? updatedUser : null;
    }

    static async updatePassword(id: number, password: string): Promise<boolean> {
        const [updatedRows] = await User.update({ password }, {
            where: { id }
        });
        return updatedRows > 0;
    }

    static async delete(id: number): Promise<boolean> {
        const deletedRows = await User.destroy({
            where: { id }
        });
        return deletedRows > 0;
    }

    static async findAll(limit = 10, offset = 0): Promise<User[]> {
        return User.findAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
    }

    static async findByRole(
        role: UserRole,
        limit = 10,
        offset = 0,
    ): Promise<User[]> {
        return User.findAll({
            where: { role },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
    }

    static async countAll(): Promise<number> {
        return User.count();
    }

    static async countByRole(role: UserRole): Promise<number> {
        return User.count({ where: { role } });
    }

    static async findBookedStudents(counselorId: number): Promise<User[]> {
        return User.findAll({
            include: [{
                model: Consultation,
                as: 'consultationsAsStudent', // Assuming default or specific alias
                where: { counselorId },
                required: true
            }],
            order: [['createdAt', 'DESC']]
        });
    }

    static async countBookedStudents(counselorId: number): Promise<number> {
        return User.count({
            include: [{
                model: Consultation,
                as: 'consultationsAsStudent',
                where: { counselorId },
                required: true
            }]
        });
    }
}
