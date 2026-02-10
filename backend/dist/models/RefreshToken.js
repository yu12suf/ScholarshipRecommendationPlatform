import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, Unique, ForeignKey, BelongsTo, CreatedAt, } from "sequelize-typescript";
import { User } from "./User.js";
@Table({
    tableName: "refresh_tokens",
    timestamps: true, // we only need created_at, but timestamps: true gives both. We can ignore updated_at or disable it if preferred.
    updatedAt: false, // Disable updatedAt column
})
export class RefreshToken extends Model {
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
    @CreatedAt
    @Column({ field: 'created_at' })
    createdAt;
}
//# sourceMappingURL=RefreshToken.js.map