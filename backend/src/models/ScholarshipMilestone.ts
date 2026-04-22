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
import { TrackedScholarship } from "./TrackedScholarship.js";

@Table({
    tableName: "scholarship_milestones",
    timestamps: true,
})
export class ScholarshipMilestone extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @ForeignKey(() => TrackedScholarship)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'tracked_scholarship_id'
    })
    declare trackedScholarshipId: number;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        defaultValue: 'OTHER',
    })
    declare type: string; // e.g., ESSAY, DOCUMENT, SUBMISSION, OTHER

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare description: string | null;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare deadline: Date;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_completed'
    })
    declare isCompleted: boolean;

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

    @BelongsTo(() => TrackedScholarship)
    trackedScholarship!: TrackedScholarship;
}
