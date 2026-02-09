import { UserModel } from "../models/User.js";
import { UpdateUserDto, UserRole, UserResponse } from "../types/userTypes.js";

export class UserService {
  static async getProfile(userId: number): Promise<UserResponse> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as UserResponse;
  }

  static async updateProfile(
    userId: number,
    updates: UpdateUserDto,
  ): Promise<UserResponse> {
    // Don't allow role changes through profile update
    const { role, ...safeUpdates } = updates;

    const updatedUser = await UserModel.update(userId, safeUpdates);
    if (!updatedUser) {
      throw new Error("User not found");
    }

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as UserResponse;
  }

  static async getAllUsers(limit = 10, page = 1): Promise<UserResponse[]> {
    const offset = (page - 1) * limit;
    const users = await UserModel.findAll(limit, offset);

    // Remove passwords from response
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as UserResponse;
    });
  }

  static async getUsersByRole(
    role: UserRole,
    limit = 10,
    page = 1,
  ): Promise<UserResponse[]> {
    const offset = (page - 1) * limit;
    const users = await UserModel.findByRole(role, limit, offset);

    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as UserResponse;
    });
  }

  static async getUserById(id: number): Promise<UserResponse> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as UserResponse;
  }

  static async updateUserRole(
    userId: number,
    role: UserRole,
    currentUserRole: UserRole,
    currentUserId: number,
  ): Promise<UserResponse> {
    // Only admins can change roles
    if (currentUserRole !== UserRole.ADMIN) {
      throw new Error("Only admins can change user roles");
    }

    // Admins cannot change their own role
    if (userId === currentUserId) {
      throw new Error("Admins cannot change their own role");
    }

    const updatedUser = await UserModel.update(userId, { role });
    if (!updatedUser) {
      throw new Error("User not found");
    }

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as UserResponse;
  }

  static async deactivateUser(
    userId: number,
    currentUserRole: UserRole,
    currentUserId: number,
  ): Promise<void> {
    // Only admins can deactivate users
    if (currentUserRole !== UserRole.ADMIN) {
      throw new Error("Only admins can deactivate users");
    }

    // Admins cannot deactivate themselves
    if (userId === currentUserId) {
      throw new Error("Admins cannot deactivate themselves");
    }

    const updatedUser = await UserModel.update(userId, { isActive: false });
    if (!updatedUser) {
      throw new Error("User not found");
    }

    // Send deactivation email
    // Note: You'll need to implement EmailService.sendAccountDeactivatedEmail
  }

  static async activateUser(
    userId: number,
    currentUserRole: UserRole,
  ): Promise<void> {
    // Only admins can activate users
    if (currentUserRole !== UserRole.ADMIN) {
      throw new Error("Only admins can activate users");
    }

    const updatedUser = await UserModel.update(userId, { isActive: true });
    if (!updatedUser) {
      throw new Error("User not found");
    }
  }
}
