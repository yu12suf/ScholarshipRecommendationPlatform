import { Model } from "sequelize-typescript";
import { User } from "./User.js";
export declare class PasswordResetToken extends Model {
    id: number;
    userId: number;
    user: User;
    token: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
}
//# sourceMappingURL=PasswordResetToken.d.ts.map