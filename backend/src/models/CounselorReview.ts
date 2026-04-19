import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import type { Student } from "./Student.js";
import type { Counselor } from "./Counselor.js";


@Table({
    tableName: "counselor_reviews",
    timestamps: true,
})
export class CounselorReview extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'booking_id'
    })
    declare bookingId: number;

    @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'student_id'
})
declare studentId: number;

@Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'counselor_id'
})
declare counselorId: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare rating: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare comment: string | null;

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

    // Associations defined in associations.ts
    declare student?: Student;
    declare counselor?: Counselor;
}
