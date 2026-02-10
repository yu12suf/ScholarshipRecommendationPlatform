import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Unique,
    Default,
    HasMany,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import { RefreshToken } from "./RefreshToken.js";
import { PasswordResetToken } from "./PasswordResetToken.js";
import { UserRole } from "../types/userTypes.js";

@Table({
    tableName: "users",
    timestamps: true,
})
export class User extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id : number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    name!: string;

    @Unique
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    email!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    password?: string;

    @Unique
    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: 'google_id'
    })
    googleId?: string;

    @Default(UserRole.STUDENT)
    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: {
            isIn: [[UserRole.STUDENT, UserRole.COUNSELOR, UserRole.ADMIN]],
        },
    })
    role!: UserRole;

    @Default(true)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_active'
    })
    isActive!: boolean;

    @CreatedAt
    @Column({ 
        type: DataType.DATE,
        field: 'created_at' })
    declare createdAt: Date;

    @UpdatedAt
    @Column({
        type: DataType.DATE,
        field: 'updated_at' })
    declare updatedAt: Date;
    


    // Associations
    @HasMany(() => RefreshToken)
    refreshTokens!: RefreshToken[];

    @HasMany(() => PasswordResetToken)
    passwordResetTokens!: PasswordResetToken[];
}
