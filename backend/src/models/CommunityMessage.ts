import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
    UpdatedAt,
    BelongsTo,
    ForeignKey,
} from "sequelize-typescript";
import { User } from "./User.js";
import { CommunityGroup } from "./CommunityGroup.js";

export enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    FILE = "file",
    LINK = "link"
}

@Table({
    tableName: "community_messages",
    timestamps: true,
})
export class CommunityMessage extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @ForeignKey(() => CommunityGroup)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'group_id'
    })
    declare groupId: number;

    @BelongsTo(() => CommunityGroup, 'groupId')
    declare group: CommunityGroup;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'sender_id'
    })
    declare senderId: number;

    @BelongsTo(() => User, 'senderId')
    declare sender: User;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    declare content: string;

    @Column({
        type: DataType.ENUM(...Object.values(MessageType)),
        allowNull: false,
        defaultValue: MessageType.TEXT,
    })
    declare messageType: MessageType;

    @Column({
        type: DataType.STRING(500),
        allowNull: true,
    })
    declare attachmentUrl: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    declare attachmentName: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare isPinned: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare isEdited: boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    declare replyToId: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    declare reactionsCount: number;

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
}