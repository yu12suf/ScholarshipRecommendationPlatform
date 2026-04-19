import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import type { Counselor } from "./Counselor.js";


@Table({
    tableName: "availability_slots",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['counselor_id', 'start_time', 'end_time']
        }
    ]
})
export class AvailabilitySlot extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'counselor_id'
})
declare counselorId: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'start_time'
    })
    declare startTime: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'end_time'
    })
    declare endTime: Date;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: 'available',
        field: 'status'
    })
    declare status: 'available' | 'booked' | 'cancelled';

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'reserved_student_id'
    })
    declare reservedStudentId: number | null;

    @Column({
        type: DataType.STRING(500),
        allowNull: true,
        field: 'meeting_link'
    })
    declare meetingLink: string | null;

    @Column({
        type: DataType.STRING(20),
        allowNull: true,
        defaultValue: 'video',
        field: 'consultation_mode'
    })
    declare consultationMode: string | null;

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

    // Association defined in associations.ts
    declare counselor?: Counselor;
}
