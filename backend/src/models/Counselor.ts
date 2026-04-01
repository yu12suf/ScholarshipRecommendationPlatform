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
    HasMany,
} from "sequelize-typescript";
import { User } from "./User.js";
import { AvailabilitySlot } from './AvailabilitySlot.js';
import { Booking } from './Booking.js';
import { CounselorReview } from './CounselorReview.js';

@Table({
    tableName: "counselors",
    timestamps: true,
    indexes: [
        { fields: ["user_id"], unique: true },
        { fields: ["verification_status"] },
        { fields: ["is_active"] },
        { fields: ["is_onboarded"] }
    ]
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
        type: DataType.DECIMAL(10, 2),
        allowNull: true,
        field: 'hourly_rate'
    })
    declare hourlyRate: number;

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
    declare verificationStatus: 'pending' | 'verified' | 'rejected';

    @Default(true)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_active'
    })
    declare isActive: boolean;

    @Column({
        type: DataType.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 0,
        field: 'rating'
    })
    declare rating: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: 'total_sessions'
    })
    declare totalSessions: number;

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

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'phone_number'
    })
    declare phoneNumber: string;

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
        type: DataType.TEXT,
        allowNull: true,
        field: 'specialized_countries'
    })
    declare specializedCountries: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'current_position'
    })
    declare currentPosition: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare organization: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'highest_education_level'
    })
    declare highestEducationLevel: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'university_name'
    })
    declare universityName: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'study_country'
    })
    declare studyCountry: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare languages: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'fields_of_study'
    })
    declare fieldsOfStudy: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'weekly_schedule'
    })
    declare weeklySchedule: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 60,
        field: 'session_duration'
    })
    declare sessionDuration: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'consultation_modes'
    })
    declare consultationModes: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'profile_image_url'
    })
    declare profileImageUrl: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'cv_url'
    })
    declare cvUrl: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'certificate_urls'
    })
    declare certificateUrls: string;

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

    @HasMany(() => AvailabilitySlot, { foreignKey: 'counselorId' })
    availabilitySlots!: AvailabilitySlot[];

    @HasMany(() => Booking, { foreignKey: 'counselorId' })
    bookings!: Booking[];

    @HasMany(() => CounselorReview, { foreignKey: 'counselorId' })
    reviews!: CounselorReview[];
}
