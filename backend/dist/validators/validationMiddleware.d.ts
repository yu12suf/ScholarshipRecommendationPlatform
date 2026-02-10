import { Request, Response, NextFunction } from 'express';
export declare const validate: (validations: any[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const registerValidation: import("express-validator").ValidationChain[];
export declare const loginValidation: import("express-validator").ValidationChain[];
export declare const forgotPasswordValidation: import("express-validator").ValidationChain[];
export declare const resetPasswordValidation: import("express-validator").ValidationChain[];
export declare const changePasswordValidation: import("express-validator").ValidationChain[];
export declare const updateProfileValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=validationMiddleware.d.ts.map