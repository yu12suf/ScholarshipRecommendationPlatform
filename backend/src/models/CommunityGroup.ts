import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    CreatedAt,
    UpdatedAt,
    HasMany,
} from "sequelize-typescript";
import { User } from "./User.js";
import { CommunityMember } from "./CommunityMember.js";
import { CommunityMessage } from "./CommunityMessage.js";

export enum CommunityGroupType {
    GROUP = 'group',
    CHANNEL = 'channel',
}

export enum CommunityPrivacy {
    PUBLIC = 'public',
    PRIVATE = 'private',
}

export enum AddMembersPermission {
    ADMIN = 'admin',
    ALL = 'all',
}

@Table({
    tableName: "community_groups",
    timestamps: true,
})
export class CommunityGroup extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 100],
        },
    })
    declare name: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare description: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
        field: 'avatar'
    })
    declare avatar: string;

    @Column({
        type: DataType.ENUM(CommunityGroupType.GROUP, CommunityGroupType.CHANNEL),
        allowNull: false,
        defaultValue: CommunityGroupType.GROUP,
    })
    declare type: CommunityGroupType;

    @Column({
        type: DataType.ENUM(CommunityPrivacy.PUBLIC, CommunityPrivacy.PRIVATE),
        allowNull: false,
        defaultValue: CommunityPrivacy.PUBLIC,
    })
    declare privacy: CommunityPrivacy;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'created_by',
    })
    declare createdBy: number;

    @Column({
        type: DataType.ENUM(AddMembersPermission.ADMIN, AddMembersPermission.ALL),
        allowNull: false,
        defaultValue: AddMembersPermission.ADMIN,
        field: 'add_members_permission'
    })
    declare addMembersPermission: AddMembersPermission;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
    })
    declare isActive: boolean;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        unique: true,
        field: 'invite_link'
    })
    declare inviteLink: string;

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

      // Associations
      @BelongsTo(() => User, { as: 'creator' })
      creator!: User;

     @HasMany(() => CommunityMember, { foreignKey: 'group_id', as: 'members' })
     members!: CommunityMember[];

     @HasMany(() => CommunityMessage, { foreignKey: 'group_id', as: 'messages' })
     messages!: CommunityMessage[];
}
