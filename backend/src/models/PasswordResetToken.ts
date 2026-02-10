import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Unique,
    ForeignKey,
    BelongsTo,
    Default,
    CreatedAt,
} from "sequelize-typescript";
import { User } from "./User.js";

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

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'user_id'
    })
    userId!: number;

    @BelongsTo(() => User)
    user!: User;

    @Unique
    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    token!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'expires_at'
    })
    expiresAt!: Date;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    used!: boolean;

    @CreatedAt
    @Column({ 
         type: DataType.DATE,
        field: 'created_at' })
    declare createdAt: Date;
}
