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
        field: 'student_id'
    })
    declare studentId: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'booking_id'
    })
    declare bookingId: number | null;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    declare amount: number;

    @Column({
        type: DataType.STRING(10),
        allowNull: false,
        defaultValue: 'ETB',
    })
    declare currency: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        unique: true,
        field: 'transaction_ref'
    })
    declare transactionRef: string | null;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        field: 'payment_status'
    })
    declare paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        field: 'escrow_status'
    })
    declare escrowStatus: 'pending' | 'held' | 'released' | 'refunded';

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        field: 'admin_commission'
    })
    declare adminCommission: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        field: 'counselor_payout'
    })
    declare counselorPayout: number;

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
