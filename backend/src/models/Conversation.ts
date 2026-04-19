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
import type { ConversationParticipant } from "./ConversationParticipant.js";
import type { ChatMessage } from "./ChatMessage.js";


@Table({
    tableName: "conversations",
    timestamps: true,
})
export class Conversation extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

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
    declare messages?: ChatMessage[];
    declare participants?: ConversationParticipant[];
    declare users?: User[];
}

