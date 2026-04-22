import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    HasMany,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import { Student } from "./Student.js";
import { Scholarship } from "./Scholarship.js";
import { ScholarshipMilestone } from "./ScholarshipMilestone.js";

@Table({
    tableName: "tracked_scholarships",
    timestamps: true,
})
export class TrackedScholarship extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @ForeignKey(() => Student)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'student_id',
        onDelete: 'CASCADE'
    })
    declare studentId: number;

    @ForeignKey(() => Scholarship)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'scholarship_id'
    })
    declare scholarshipId: number;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'manual_deadline'
    })
    declare manualDeadline: Date | null;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: 'NOT_STARTED',
    })
    declare status: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 3, // Default 3 days before
        field: 'notification_lead_time'
    })
    declare notificationLeadTime: number;

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

    @BelongsTo(() => Student)
    student!: Student;

    @BelongsTo(() => Scholarship)
    scholarship!: Scholarship;

    @HasMany(() => ScholarshipMilestone)
    milestones!: ScholarshipMilestone[];
}
