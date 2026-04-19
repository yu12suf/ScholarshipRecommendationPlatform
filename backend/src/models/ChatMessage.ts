import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
    UpdatedAt,
    Default,
} from "sequelize-typescript";
import type { User } from "./User.js";
import type { Conversation } from "./Conversation.js";


@Table({
    tableName: "chat_messages",
    timestamps: true,
})
export class ChatMessage extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'conversation_id'
})
declare conversationId: number;

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

    // Associations defined in associations.ts
    declare conversation?: Conversation;
    declare sender?: User;
}
