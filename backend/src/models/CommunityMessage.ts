import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import type { User } from "./User.js";
import type { CommunityGroup } from "./CommunityGroup.js";


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

    @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'group_id'
})
declare groupId: number;

@Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'sender_id'
})
declare senderId: number;

// Associations defined in associations.ts

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: 'content'
    })
    declare content: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: MessageType.TEXT,
        field: 'message_type',
        validate: {
            isIn: [Object.values(MessageType)]
        }
    })
    declare messageType: MessageType;

    @Column({
        type: DataType.STRING(500),
        allowNull: true,
        field: 'attachment_url'
    })
    declare attachmentUrl: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
        field: 'attachment_name'
    })
    declare attachmentName: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_pinned'
    })
    declare isPinned: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_edited'
    })
    declare isEdited: boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'reply_to_id'
    })
    declare replyToId: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'reactions_count'
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

    // Associations defined in associations.ts
    declare group?: CommunityGroup;
    declare sender?: User;
}