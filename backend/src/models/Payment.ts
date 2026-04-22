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
import { Booking } from "./Booking.js";

@Table({
    tableName: "payments",
    timestamps: true,
})
export class Payment extends Model {
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

    @ForeignKey(() => Booking)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'booking_id',
        onDelete: 'SET NULL'
    })
    declare bookingId: number | null;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        field: 'amount'
    })
    declare amount: number;

    @Column({
        type: DataType.STRING(10),
        allowNull: false,
        defaultValue: 'ETB',
        field: 'currency'
    })
    declare currency: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        unique: true,
        field: 'tx_ref'
    })
    declare tx_ref: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        field: 'status'
    })
    declare status: 'pending' | 'success' | 'failed';

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

    @BelongsTo(() => Booking)
    booking!: Booking;
}
