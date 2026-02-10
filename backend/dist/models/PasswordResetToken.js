import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Unique, ForeignKey, BelongsTo, Default, CreatedAt, } from "sequelize-typescript";
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
    id;
    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'user_id'
    })
    userId;
    @BelongsTo(() => User)
    user;
    @Unique
    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    token;
    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'expires_at'
    })
    expiresAt;
    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    used;
    @CreatedAt
    @Column({ field: 'created_at' })
    createdAt;
}
//# sourceMappingURL=PasswordResetToken.js.map