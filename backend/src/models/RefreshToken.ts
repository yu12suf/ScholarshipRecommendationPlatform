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
    CreatedAt,
} from "sequelize-typescript";
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

        @CreatedAt
        @Column({ 
            type: DataType.DATE,
            field: 'created_at' })
        declare createdAt: Date;
}