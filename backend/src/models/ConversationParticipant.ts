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
import type { Conversation } from "./Conversation.js";


@Table({
    tableName: "conversation_participants",
    timestamps: true,
})
export class ConversationParticipant extends Model {
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
    field: 'user_id'
})
declare userId: number;

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
    declare user?: User;
}

