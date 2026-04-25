import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import { User } from "./User.js";
import { CommunityGroup } from "./CommunityGroup.js";

export enum MemberRole {
    ADMIN = 'admin',
    MODERATOR = 'moderator',
    MEMBER = 'member',
}

export enum MemberStatus {
    ACTIVE = 'active',
    LEFT = 'left',
    REMOVED = 'removed',
}

@Table({
    tableName: "community_members",
    timestamps: true,
    indexes: [
        {
            name: 'uq_community_member_group_user',
            fields: ['group_id', 'user_id'],
            unique: true
        }
    ]
})
export class CommunityMember extends Model {
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
        field: 'user_id',
        onDelete: 'CASCADE'
    })
    declare userId: number;

    @Column({
        type: DataType.ENUM(MemberRole.ADMIN, MemberRole.MODERATOR, MemberRole.MEMBER),
        allowNull: false,
        defaultValue: MemberRole.MEMBER,
    })
    declare role: MemberRole;

    @Column({
        type: DataType.ENUM(MemberStatus.ACTIVE, MemberStatus.LEFT, MemberStatus.REMOVED),
        allowNull: false,
        defaultValue: MemberStatus.ACTIVE,
    })
    declare status: MemberStatus;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: 'joined_at'
    })
    declare joinedAt: Date;

    @UpdatedAt
    @Column({
        type: DataType.DATE,
        field: 'updated_at'
    })
    declare updatedAt: Date;

     @BelongsTo(() => CommunityGroup, { as: 'group' })
      group!: CommunityGroup;

      @BelongsTo(() => User, { as: 'user' })
      user!: User;
}
