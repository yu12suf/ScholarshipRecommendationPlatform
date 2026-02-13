import { UserRepository } from "../repositories/UserRepository.js";
import { StudentRepository } from "../repositories/StudentRepository.js";
import { CounselorRepository } from "../repositories/CounselorRepository.js";
import { CreateUserDto, UpdateUserDto, UserRole } from "../types/userTypes.js";
import { User } from "../models/User.js";

export class UserService {
  static async createUser(userData: CreateUserDto): Promise<User> {
    const user = await UserRepository.create(userData);

    if (user.role === UserRole.STUDENT) {
      await StudentRepository.create({ userId: user.id });
    } else if (user.role === UserRole.COUNSELOR) {
      await CounselorRepository.create({ userId: user.id });
    }

    return user;
  }

  static async getProfile(userId: number): Promise<User | null> {
    return UserRepository.findById(userId);
  }

  static async updateProfile(userId: number, updates: UpdateUserDto): Promise<User | null> {
    // Business logic: Ensure admins cannot demote themselves accidentally, etc.
    return UserRepository.update(userId, updates);
  }

  static async getAllUsers(limit: number, offset: number): Promise<User[]> {
    return UserRepository.findAll(limit, offset);
  }

  static async getUserById(id: number): Promise<User | null> {
    return UserRepository.findById(id);
  }

  static async getUsersByRole(role: UserRole): Promise<User[]> {
    return UserRepository.findByRole(role);
  }

  static async updateUserRole(id: number, role: UserRole): Promise<User | null> {
    return UserRepository.update(id, { role });
  }

  static async deactivateUser(id: number): Promise<User | null> {
    return UserRepository.update(id, { isActive: false });
  }

  static async activateUser(id: number): Promise<User | null> {
    return UserRepository.update(id, { isActive: true });
  }
}
