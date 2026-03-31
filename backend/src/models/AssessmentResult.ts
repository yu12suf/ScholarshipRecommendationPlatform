import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import { Student } from "./Student.js";

@Table({
    tableName: "assessment_results",
    timestamps: true,
})
export class AssessmentResult extends Model {
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
        field: 'student_id'
    })
    declare studentId: number;

    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'test_id'
    })
    declare testId: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        field: 'exam_type'
    })
    declare examType: string;

    @Column({
        type: DataType.STRING(10),
        allowNull: false,
        field: 'difficulty'
    })
    declare difficulty: string;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
    })
    declare evaluation: any;

    @Column({
        type: DataType.JSONB,
        allowNull: true,
        field: 'score_breakdown'
    })
    declare scoreBreakdown: any;

    @Column({
        type: DataType.DECIMAL(5, 2),
        allowNull: false,
        field: 'overall_band'
    })
    declare overallBand: number;

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
}
