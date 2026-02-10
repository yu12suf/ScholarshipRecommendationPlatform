import { Model } from "sequelize-typescript";
import { User } from "./User.js";
export declare class RefreshToken extends Model {
    id: number;
    userId: number;
    user: User;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}
//# sourceMappingURL=RefreshToken.d.ts.map