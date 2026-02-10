import { UserService } from "../services/UserService.js";
export class UserController {
    static async getProfile(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const user = await UserService.getProfile(req.user.id);
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.json(user);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const updates = req.body;
            const user = await UserService.updateProfile(req.user.id, updates);
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.json(user);
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const users = await UserService.getAllUsers(limit, offset);
            res.json(users);
        }
        catch (error) {
            next(error);
        }
    }
    static async getUsersByRole(req, res, next) {
        try {
            const { role } = req.params;
            const users = await UserService.getUsersByRole(role);
            res.json(users);
        }
        catch (error) {
            next(error);
        }
    }
    static async getUserById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const user = await UserService.getUserById(id);
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.json(user);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateUserRole(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const { role } = req.body;
            const user = await UserService.updateUserRole(id, role);
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.json(user);
        }
        catch (error) {
            next(error);
        }
    }
    static async deactivateUser(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const user = await UserService.deactivateUser(id);
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.json({ message: "User deactivated successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    static async activateUser(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const user = await UserService.activateUser(id);
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.json({ message: "User activated successfully" });
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=UserController.js.map