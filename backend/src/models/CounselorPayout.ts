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

@Table({
    tableName: "counselor_payouts",
    timestamps: true,
})
export class CounselorPayout extends Model {
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
        field: 'counselor_id',
        onDelete: 'CASCADE'
    })
    declare counselorId: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        field: 'amount'
    })
    declare amount: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        unique: true,
        field: 'transaction_reference'
    })
    declare transactionReference: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
        field: 'status'
    })
    declare status: 'pending' | 'approved' | 'rejected' | 'completed';

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: 'payout_method'
    })
    declare payoutMethod: string;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
        field: 'payout_details'
    })
    declare payoutDetails: any;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'admin_note'
    })
    declare adminNote: string;

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

    @BelongsTo(() => Counselor)
    counselor!: Counselor;
}
