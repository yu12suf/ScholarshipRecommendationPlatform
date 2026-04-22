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
    timestamps: true,
    updatedAt: false,
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
        field: 'user_id',
        onDelete: 'CASCADE'
    })
    declare userId: number;

    @BelongsTo(() => User)
    user!: User;

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
}