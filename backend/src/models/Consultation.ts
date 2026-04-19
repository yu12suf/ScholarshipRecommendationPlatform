import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import type { User } from "./User.js";


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

    // Associations defined in associations.ts
    declare student?: User;
    declare counselor?: User;
}
