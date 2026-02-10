import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types";
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authorize: (...allowedRoles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const optionalAuthenticate: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map