import { UserRepository } from "../repositories/UserRepository.js";
import { CreateUserDto, UpdateUserDto, UserRole } from "../types/userTypes.js";
import { User } from "../models/User.js";

export class UserService {
  static async createUser(userData: CreateUserDto): Promise<User> {
    // You could add complex validation or business logic here
    // For example, checking if the email is from a specific domain
    return UserRepository.create(userData);
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
