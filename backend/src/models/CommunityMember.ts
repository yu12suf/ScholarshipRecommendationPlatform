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
import type { CommunityGroup } from "./CommunityGroup.js";


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

    @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'group_id'
})
declare groupId: number;

@Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id'
})
declare userId: number;

    // Associations defined in associations.ts

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: CommunityMemberRole.MEMBER,
        validate: {
            isIn: [Object.values(CommunityMemberRole)]
        }
    })
    declare role: CommunityMemberRole;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: CommunityMemberStatus.ACTIVE,
        validate: {
            isIn: [Object.values(CommunityMemberStatus)]
        }
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

    // Associations defined in associations.ts
    declare group?: CommunityGroup;
    declare user?: User;
}