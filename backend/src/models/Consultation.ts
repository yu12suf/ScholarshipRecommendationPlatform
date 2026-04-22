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
import { User } from "./User.js";

@Table({
    tableName: "consultations",
    timestamps: true,
})
export class Consultation extends Model {
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
        field: 'student_id',
        onDelete: 'CASCADE'
    })
    declare studentId: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'counselor_id',
        onDelete: 'CASCADE'
    })
    declare counselorId: number;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: 'scheduled',
    })
    declare status: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'session_date'
    })
    declare sessionDate: Date;

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

    @BelongsTo(() => User, 'student_id')
    student!: User;

    @BelongsTo(() => User, 'counselor_id')
    counselor!: User;
}
