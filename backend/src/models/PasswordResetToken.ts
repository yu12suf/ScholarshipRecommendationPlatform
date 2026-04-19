import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Unique,
    Default,
    CreatedAt,
} from "sequelize-typescript";
import type { User } from "./User.js";


@Table({
    tableName: "password_reset_tokens",
    timestamps: true,
    updatedAt: false,
})
export class PasswordResetToken extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id'
})
declare userId: number;

    // Association defined in associations.ts
    user?: User;

    @Unique
    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    declare token: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'expires_at'
    })
    declare expiresAt: Date;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    declare used: boolean;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: 'created_at'
    })
    declare createdAt: Date;
}
