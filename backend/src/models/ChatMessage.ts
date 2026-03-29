import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    CreatedAt,
    UpdatedAt,
    BelongsTo,
    Default,
} from "sequelize-typescript";
import { User } from "./User.js";
import { Conversation } from "./Conversation.js";

@Table({
    tableName: "chat_messages",
    timestamps: true,
})
export class ChatMessage extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @ForeignKey(() => Conversation)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'conversation_id'
    })
    declare conversationId: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'sender_id'
    })
    declare senderId: number;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    declare content: string;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_read'
    })
    declare isRead: boolean;

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

    @BelongsTo(() => Conversation)
    conversation!: Conversation;

    @BelongsTo(() => User)
    sender!: User;
}
