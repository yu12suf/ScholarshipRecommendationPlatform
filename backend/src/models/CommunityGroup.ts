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
    BelongsTo,
    ForeignKey,
} from "sequelize-typescript";
import { User } from "./User.js";
import { CommunityMember } from "./CommunityMember.js";
import { CommunityMessage } from "./CommunityMessage.js";

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
        type: DataType.ENUM(...Object.values(CommunityGroupType)),
        allowNull: false,
        defaultValue: CommunityGroupType.GROUP,
    })
    declare type: CommunityGroupType;

    @Column({
        type: DataType.ENUM(...Object.values(CommunityGroupPrivacy)),
        allowNull: false,
        defaultValue: CommunityGroupPrivacy.PUBLIC,
    })
    declare privacy: CommunityGroupPrivacy;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'created_by'
    })
    declare createdBy: number;

    @BelongsTo(() => User, 'createdBy')
    declare creator: User;

    @Column({
        type: DataType.STRING(50),
        allowNull: true,
        unique: true,
    })
    declare inviteLink: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    declare memberCount: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    @HasMany(() => CommunityMember)
    declare members: CommunityMember[];

    @HasMany(() => CommunityMessage)
    declare messages: CommunityMessage[];
}