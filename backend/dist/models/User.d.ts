import { Model } from "sequelize-typescript";
import { RefreshToken } from "./RefreshToken.js";
import { PasswordResetToken } from "./PasswordResetToken.js";
import { UserRole } from "../types/userTypes.js";
export declare class User extends Model {
    id: number;
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    refreshTokens: RefreshToken[];
    passwordResetTokens: PasswordResetToken[];
}
//# sourceMappingURL=User.d.ts.map