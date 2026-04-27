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
    HasOne,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import { RefreshToken } from "./RefreshToken.js";
import { PasswordResetToken } from "./PasswordResetToken.js";
import { Consultation } from "./Consultation.js";
import { Counselor } from "./Counselor.js";
import { Student } from "./Student.js";
import { Notification } from "./Notification.js";
import { UserRole } from "../types/userTypes.js";

@Table({
    tableName: "users",
    timestamps: true,
})
export class User extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    declare name: string;

    @Unique
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    declare email: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    declare password?: string;

    @Unique
    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: 'google_id'
    })
    declare googleId?: string;

    @Default(UserRole.STUDENT)
    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: {
            isIn: [[UserRole.STUDENT, UserRole.COUNSELOR, UserRole.ADMIN]],
        },
    })
    declare role: UserRole;

    @Default(true)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_active'
    })
    declare isActive: boolean;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: 'created_at'
    })
    declare createdAt: Date;

    @UpdatedAt
    @Column({
        type: DataType.DATE,
        field: 'updated_at'
    })
    declare updatedAt: Date;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
        field: 'avatar_url'
    })
    declare avatarUrl?: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
        field: 'fcm_token'
    })
    declare fcmToken?: string;



    // Associations
    @HasMany(() => RefreshToken, { onDelete: 'CASCADE' })
    refreshTokens!: RefreshToken[];

    @HasMany(() => PasswordResetToken, { onDelete: 'CASCADE' })
    passwordResetTokens!: PasswordResetToken[];

    @HasMany(() => Consultation, { foreignKey: 'student_id', onDelete: 'CASCADE' })
    consultationsAsStudent!: Consultation[];

    @HasMany(() => Consultation, { foreignKey: 'counselor_id', onDelete: 'CASCADE' })
    consultationsAsCounselor!: Consultation[];

    @HasOne(() => Counselor, { onDelete: 'CASCADE' })
    counselor!: Counselor;

    @HasOne(() => Student, { onDelete: 'CASCADE' })
    student!: Student;

    @HasMany(() => Notification, { onDelete: 'CASCADE' })
    notifications!: Notification[];
}
