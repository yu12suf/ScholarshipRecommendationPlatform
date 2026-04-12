import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
    BelongsTo,
    ForeignKey,
} from "sequelize-typescript";
import { User } from "./User.js";
import { CommunityMessage } from "./CommunityMessage.js";

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

    @ForeignKey(() => CommunityMessage)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'message_id'
    })
    declare messageId: number;

    @BelongsTo(() => CommunityMessage, 'messageId')
    declare message: CommunityMessage;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'user_id'
    })
    declare userId: number;

    @BelongsTo(() => User, 'userId')
    declare user: User;

    @Column({
        type: DataType.STRING(10),
        allowNull: false,
    })
    declare emoji: string;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: 'created_at'
    })
    declare createdAt: Date;
}