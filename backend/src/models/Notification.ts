import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import type { User } from "./User.js";


@Table({
    tableName: "notifications",
    timestamps: true,
})
export class Notification extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id'
})
declare userId: number;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    declare title: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    declare message: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        defaultValue: 'SCHOLARSHIP_MATCH'
    })
    declare type: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'related_id'
    })
    declare relatedId?: number | undefined;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_read'
    })
    declare isRead: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_delivered'
    })
    declare isDelivered: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_clicked'
    })
    declare isClicked: boolean;

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

    // Association defined in associations.ts
    declare user?: User;
}
