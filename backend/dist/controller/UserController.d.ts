import { Request, Response, NextFunction } from "express";
export declare class UserController {
    static getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getUsersByRole(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getUserById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    static activateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=UserController.d.ts.map