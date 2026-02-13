import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    Default,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import { User } from "./User.js";

@Table({
    tableName: "counselors",
    timestamps: true,
})
export class Counselor extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'user_id'
    })
    declare userId: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare bio: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'areas_of_expertise'
    })
    declare areasOfExpertise: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'years_of_experience'
    })
    declare yearsOfExperience: number;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        field: 'verification_status'
    })
    declare verificationStatus: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'extracted_data'
    })
    declare extractedData: string;

    @Column({
        type: DataType.DECIMAL(3, 2),
        allowNull: true,
        field: 'id_match_confidence'
    })
    declare idMatchConfidence: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'identity_verified'
    })
    declare identityVerified: boolean;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_onboarded'
    })
    declare isOnboarded: boolean;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'document_url'
    })
    declare documentUrl: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'id_card_url'
    })
    declare idCardUrl: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'selfie_url'
    })
    declare selfieUrl: string;

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

    @BelongsTo(() => User)
    user!: User;
}
