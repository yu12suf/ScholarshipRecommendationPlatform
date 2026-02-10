import { UserRepository } from "../repositories/UserRepository.js";
export class UserService {
    static async createUser(userData) {
        // You could add complex validation or business logic here
        // For example, checking if the email is from a specific domain
        return UserRepository.create(userData);
    }
    static async getProfile(userId) {
        return UserRepository.findById(userId);
    }
    static async updateProfile(userId, updates) {
        // Business logic: Ensure admins cannot demote themselves accidentally, etc.
        return UserRepository.update(userId, updates);
    }
    static async getAllUsers(limit, offset) {
        return UserRepository.findAll(limit, offset);
    }
    static async getUserById(id) {
        return UserRepository.findById(id);
    }
    static async getUsersByRole(role) {
        return UserRepository.findByRole(role);
    }
    static async updateUserRole(id, role) {
        return UserRepository.update(id, { role });
    }
    static async deactivateUser(id) {
        return UserRepository.update(id, { isActive: false });
    }
    static async activateUser(id) {
        return UserRepository.update(id, { isActive: true });
    }
}
//# sourceMappingURL=UserService.js.map