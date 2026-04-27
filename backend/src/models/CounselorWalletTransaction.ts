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
import { Counselor } from "./Counselor.js";
import { Booking } from "./Booking.js";
import { Payment } from "./Payment.js";

@Table({
    tableName: "counselor_wallet_transactions",
    timestamps: true,
})
export class CounselorWalletTransaction extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @ForeignKey(() => Counselor)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: "counselor_id",
        onDelete: "CASCADE",
    })
    declare counselorId: number;

    @ForeignKey(() => Booking)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: "booking_id",
        onDelete: "SET NULL",
    })
    declare bookingId: number | null;

    @ForeignKey(() => Payment)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: "payment_id",
        onDelete: "SET NULL",
    })
    declare paymentId: number | null;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        field: "entry_type",
    })
    declare entryType: "deposit" | "withdrawal";

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    declare amount: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: "balance_after",
    })
    declare balanceAfter: number;

    @Column({
        type: DataType.STRING(120),
        allowNull: false,
        field: "reference",
    })
    declare reference: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: "note",
    })
    declare note: string | null;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: "created_at",
    })
    declare createdAt: Date;

    @UpdatedAt
    @Column({
        type: DataType.DATE,
        field: "updated_at",
    })
    declare updatedAt: Date;

    @BelongsTo(() => Counselor)
    counselor!: Counselor;

    @BelongsTo(() => Booking)
    booking!: Booking;

    @BelongsTo(() => Payment)
    payment!: Payment;
}
