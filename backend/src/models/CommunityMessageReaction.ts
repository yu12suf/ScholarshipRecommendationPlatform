import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
} from "sequelize-typescript";
import type { User } from "./User.js";
import type { CommunityMessage } from "./CommunityMessage.js";


@Table({
    tableName: "community_message_reactions",
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['message_id', 'user_id', 'emoji']
        }
    ]
})
export class CommunityMessageReaction extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'message_id'
})
declare messageId: number;

@Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id'
})
declare userId: number;

    // Associations defined in associations.ts

    @Column({
        type: DataType.STRING(10),
        allowNull: false,
    })
    declare emoji: string;

    // Associations defined in associations.ts
    declare message?: CommunityMessage;
    declare user?: User;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: 'created_at'
    })
    declare createdAt: Date;
}