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
    tableName: "students",
    timestamps: true,
})
export class Student extends Model {
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
        type: DataType.DECIMAL(3, 2),
        allowNull: true,
        field: 'calculated_gpa'
    })
    declare calculatedGpa: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'academic_history'
    })
    declare academicHistory: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'study_preferences'
    })
    declare studyPreferences: string;

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
        field: 'intake_season'
    })
    declare intakeSeason: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'funding_requirement'
    })
    declare fundingRequirement: string;

    @Column({
        type: DataType.DECIMAL(3, 1),
        allowNull: true,
        field: 'ielts_score'
    })
    declare ieltsScore: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'toefl_score'
    })
    declare toeflScore: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'duolingo_score'
    })
    declare duolingoScore: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare gender: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    declare age: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'work_experience'
    })
    declare workExperience: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'country_interest'
    })
    declare countryInterest: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'high_school'
    })
    declare highSchool: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'academic_status'
    })
    declare academicStatus: string;

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

    @Column({
        type: 'vector(3072)',
        allowNull: true,
    })
    declare embedding: any;

    @Column({
        type: DataType.STRING(32),
        allowNull: true,
        field: 'profile_hash'
    })
    declare profileHash: string | null;

    @BelongsTo(() => User)
    user!: User;
}
