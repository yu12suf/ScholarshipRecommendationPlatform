import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
    UpdatedAt,
    BelongsTo,
    ForeignKey,
} from "sequelize-typescript";
import { User } from "./User.js";
import { CommunityGroup } from "./CommunityGroup.js";

export enum CommunityMemberRole {
    ADMIN = "admin",
    MODERATOR = "moderator",
    MEMBER = "member"
}

export enum CommunityMemberStatus {
    ACTIVE = "active",
    LEFT = "left",
    REMOVED = "removed"
}

@Table({
    tableName: "community_members",
    timestamps: true,
})
export class CommunityMember extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @ForeignKey(() => CommunityGroup)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'group_id'
    })
    declare groupId: number;

    @BelongsTo(() => CommunityGroup, 'groupId')
    declare group: CommunityGroup;

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
        type: DataType.ENUM(...Object.values(CommunityMemberRole)),
        allowNull: false,
        defaultValue: CommunityMemberRole.MEMBER,
    })
    declare role: CommunityMemberRole;

    @Column({
        type: DataType.ENUM(...Object.values(CommunityMemberStatus)),
        allowNull: false,
        defaultValue: CommunityMemberStatus.ACTIVE,
    })
    declare status: CommunityMemberStatus;

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
}