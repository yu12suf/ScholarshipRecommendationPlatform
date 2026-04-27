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
import { Counselor } from "./Counselor.js";
import { AvailabilitySlot } from "./AvailabilitySlot.js";
import { Payment } from "./Payment.js";

@Table({
    tableName: "bookings",
    timestamps: true,
})
export class Booking extends Model {
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

    @ForeignKey(() => Counselor)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'counselor_id',
        onDelete: 'CASCADE'
    })
    declare counselorId: number;

    @ForeignKey(() => AvailabilitySlot)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'slot_id'
    })
    declare slotId: number;

    @ForeignKey(() => Payment)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'payment_id'
    })
    declare paymentId: number | null;

    @Column({
        type: DataType.STRING(32),
        allowNull: false,
        defaultValue: 'pending',
        field: 'status'
    })
    declare status: 'pending' | 'confirmed' | 'started' | 'awaiting_confirmation' | 'completed' | 'cancelled' | 'disputed';

    @Column({
        type: DataType.STRING(500),
        allowNull: true,
        field: 'meeting_link'
    })
    declare meetingLink: string | null;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'started_at'
    })
    declare startedAt: Date | null;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'completed_at'
    })
    declare completedAt: Date | null;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare notes: string | null;

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

    // Associations with explicit aliases to match service queries
    @BelongsTo(() => Student, { as: 'student' })
    student!: Student;

    @BelongsTo(() => Counselor, { as: 'counselor' })
    counselor!: Counselor;

    @BelongsTo(() => AvailabilitySlot, { as: 'slot' })
    slot!: AvailabilitySlot;

    @BelongsTo(() => Payment, { as: 'payment' })
    payment!: Payment;
}