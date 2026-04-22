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
    indexes: [
        { fields: ["user_id"], unique: true },
        { fields: ["is_onboarded"] }
    ]
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
        field: 'user_id',
        onDelete: 'CASCADE'
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
        field: 'cv_url'
    })
    declare cvUrl: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'transcript_url'
    })
    declare transcriptUrl: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'certificate_url'
    })
    declare certificateUrl: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'degree_certificate_url'
    })
    declare degreeCertificateUrl: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'language_certificate_url'
    })
    declare languageCertificateUrl: string;

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
        type: DataType.DATEONLY,
        allowNull: true,
        field: 'date_of_birth'
    })
    declare dateOfBirth: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare nationality: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'country_of_residence'
    })
    declare countryOfResidence: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare city: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'phone_number'
    })
    declare phoneNumber: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'field_of_study'
    })
    declare fieldOfStudy: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'current_university'
    })
    declare currentUniversity: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'graduation_year'
    })
    declare graduationYear: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'degree_seeking'
    })
    declare degreeSeeking: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'preferred_degree_level'
    })
    declare preferredDegreeLevel: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'study_mode'
    })
    declare studyMode: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'preferred_countries'
    })
    declare preferredCountries: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'preferred_universities'
    })
    declare preferredUniversities: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'language_test_type'
    })
    declare languageTestType: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'language_score'
    })
    declare languageScore: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: true,
        field: 'needs_financial_support'
    })
    declare needsFinancialSupport: boolean;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'family_income_range'
    })
    declare familyIncomeRange: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'research_area'
    })
    declare researchArea: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'proposed_research_topic'
    })
    declare proposedResearchTopic: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'notification_preferences'
    })
    declare notificationPreferences: string;

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

    // Embedding fields for vector search (added from dev branch)
    @Column({
        type: 'VECTOR(3072)',
        allowNull: true,
    })
    declare embedding: any;

    @Column({
        type: DataType.STRING(32),
        allowNull: true,
        field: 'profile_hash'
    })
    declare profileHash: string | null;

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

    // Association with explicit alias to match service queries
    @BelongsTo(() => User, { as: 'user' })
    user!: User;
}