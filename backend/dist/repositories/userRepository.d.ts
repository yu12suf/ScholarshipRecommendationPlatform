import { User } from "../models/User.js";
import { CreateUserDto, UpdateUserDto, UserRole } from "../types/userTypes.js";
export declare class UserRepository {
    static create(userData: CreateUserDto): Promise<User>;
    static createIfNotExists(userData: CreateUserDto & {
        is_active?: boolean;
    }): Promise<void>;
    static findByEmail(email: string): Promise<User | null>;
    static findByGoogleId(googleId: string): Promise<User | null>;
    static findById(id: number): Promise<User | null>;
    static findByName(name: string): Promise<User | null>;
    static update(id: number, updates: UpdateUserDto): Promise<User | null>;
    static updatePassword(id: number, password: string): Promise<boolean>;
    static delete(id: number): Promise<boolean>;
    static findAll(limit?: number, offset?: number): Promise<User[]>;
    static findByRole(role: UserRole, limit?: number, offset?: number): Promise<User[]>;
}
//# sourceMappingURL=UserRepository.d.ts.map