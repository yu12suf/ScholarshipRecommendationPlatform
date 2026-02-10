import { CreateUserDto, UpdateUserDto, UserRole } from "../types/userTypes.js";
import { User } from "../models/User.js";
export declare class UserService {
    static createUser(userData: CreateUserDto): Promise<User>;
    static getProfile(userId: number): Promise<User | null>;
    static updateProfile(userId: number, updates: UpdateUserDto): Promise<User | null>;
    static getAllUsers(limit: number, offset: number): Promise<User[]>;
    static getUserById(id: number): Promise<User | null>;
    static getUsersByRole(role: UserRole): Promise<User[]>;
    static updateUserRole(id: number, role: UserRole): Promise<User | null>;
    static deactivateUser(id: number): Promise<User | null>;
    static activateUser(id: number): Promise<User | null>;
}
//# sourceMappingURL=UserService.d.ts.map