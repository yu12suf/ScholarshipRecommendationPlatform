import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Unique, Default, HasMany, CreatedAt, UpdatedAt, } from "sequelize-typescript";
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
    id;
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    name;
    @Unique
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    email;
    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    password;
    @Unique
    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: 'google_id'
    })
    googleId;
    @Default(UserRole.STUDENT)
    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: {
            isIn: [[UserRole.STUDENT, UserRole.COUNSELOR, UserRole.ADMIN]],
        },
    })
    role;
    @Default(true)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_active'
    })
    isActive;
    @CreatedAt
    @Column({ field: 'created_at' })
    createdAt;
    @UpdatedAt
    @Column({ field: 'updated_at' })
    updatedAt;
    // Associations
    @HasMany(() => RefreshToken)
    refreshTokens;
    @HasMany(() => PasswordResetToken)
    passwordResetTokens;
}
//# sourceMappingURL=User.js.map