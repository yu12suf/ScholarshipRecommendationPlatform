import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    CreatedAt,
} from "sequelize-typescript";
import { User } from "./User.js";
import { CommunityMessage } from "./CommunityMessage.js";

@Table({
    tableName: "message_reactions",
    timestamps: true,
    indexes: [
        {
            name: 'uq_message_reaction_user_emoji',
            fields: ['message_id', 'user_id', 'emoji'],
            unique: true
        }
    ]
})
export class MessageReaction extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @ForeignKey(() => CommunityMessage)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'message_id',
        onDelete: 'CASCADE'
    })
    declare messageId: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'user_id',
    })
    declare userId: number;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
    })
    declare emoji: string;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: 'created_at'
    })
    declare createdAt: Date;

     @BelongsTo(() => CommunityMessage, { as: 'message' })
      message!: CommunityMessage;

      @BelongsTo(() => User, { as: 'user' })
      user!: User;
}
