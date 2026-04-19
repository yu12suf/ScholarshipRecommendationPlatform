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
import type { CommunityMember } from "./CommunityMember.js";
import type { CommunityMessage } from "./CommunityMessage.js";


export enum CommunityGroupType {
    GROUP = "group",
    CHANNEL = "channel"
}

export enum CommunityGroupPrivacy {
    PUBLIC = "public",
    PRIVATE = "private"
}

@Table({
    tableName: "community_groups",
    timestamps: true,
})
export class CommunityGroup extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare description: string;

    @Column({
        type: DataType.STRING(500),
        allowNull: true,
    })
    declare avatar: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: CommunityGroupType.GROUP,
        validate: {
            isIn: [Object.values(CommunityGroupType)]
        }
    })
    declare type: CommunityGroupType;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: CommunityGroupPrivacy.PUBLIC,
        validate: {
            isIn: [Object.values(CommunityGroupPrivacy)]
        }
    })
    declare privacy: CommunityGroupPrivacy;

    @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'created_by'
})
declare createdBy: number;

    @Column({
        type: DataType.STRING(50),
        allowNull: true,
        unique: true,
        field: 'invite_link'
    })
    declare inviteLink: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: 'admin',
        field: 'add_members_permission'
    })
    declare addMembersPermission: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'member_count'
    })
    declare memberCount: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
    })
    declare isActive: boolean;

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

    // Association with creator - defined in associations.ts
    // Associations defined in associations.ts
    declare creator?: User;
    declare members?: CommunityMember[];
    declare messages?: CommunityMessage[];
}