import { Request, Response, NextFunction } from "express";
export declare class AuthController {
    static register(req: Request, res: Response, next: NextFunction): Promise<void>;
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static googleLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
    static refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
    static logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    static logoutAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    static forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    static resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    static changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    static me(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map