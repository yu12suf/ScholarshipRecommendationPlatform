import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
    UpdatedAt,
    HasMany,
    BelongsToMany,
} from "sequelize-typescript";
import { User } from "./User.js";
import { ConversationParticipant } from "./ConversationParticipant.js";
import { ChatMessage } from "./ChatMessage.js";

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

    @HasMany(() => ChatMessage)
    declare messages: ChatMessage[];

    @HasMany(() => ConversationParticipant)
    declare participants: ConversationParticipant[];

    @BelongsToMany(() => User, () => ConversationParticipant)
    declare users: User[];
}

