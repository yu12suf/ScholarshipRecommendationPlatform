import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    HasMany,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import { User } from "./User.js";
import { CommunityGroup } from "./CommunityGroup.js";
import { MessageReaction } from "./MessageReaction.js";

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    FILE = 'file',
    LINK = 'link',
}

@Table({
    tableName: "community_messages",
    timestamps: true,
})
export class CommunityMessage extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @ForeignKey(() => CommunityGroup)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'group_id',
        onDelete: 'CASCADE'
    })
    declare groupId: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'sender_id',
        onDelete: 'CASCADE'
    })
    declare senderId: number;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: 'content'
    })
    declare content: string;

    @Column({
        type: DataType.ENUM(MessageType.TEXT, MessageType.IMAGE, MessageType.FILE, MessageType.LINK),
        allowNull: false,
        defaultValue: MessageType.TEXT,
        field: 'message_type'
    })
    declare messageType: MessageType;

    @Column({
        type: DataType.STRING(500),
        allowNull: true,
    })
    declare attachmentUrl: string | null;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    declare attachmentName: string | null;

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

    @ForeignKey(() => CommunityMessage)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'reply_to_id',
        onDelete: 'SET NULL'
    })
    declare replyToId: number | null;

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

     // Associations
     @BelongsTo(() => CommunityGroup, { as: 'group' })
      group!: CommunityGroup;

      @BelongsTo(() => User, { as: 'sender' })
      sender!: User;

      @BelongsTo(() => CommunityMessage, {
          as: 'replyTo'
      })
      replyTo?: CommunityMessage;

     @HasMany(() => MessageReaction, { foreignKey: 'message_id', as: 'reactions' })
     reactions!: MessageReaction[];
}
