import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Unique,
    CreatedAt,
} from "sequelize-typescript";
import type { User } from "./User.js";

@Table({
    tableName: "refresh_tokens",
    timestamps: true,
    updatedAt: false,
})
export class RefreshToken extends Model {
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

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: 'created_at'
    })
    declare createdAt: Date;

    // Association defined in associations.ts
    user?: User;
}
