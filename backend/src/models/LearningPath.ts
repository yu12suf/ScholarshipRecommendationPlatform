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
    tableName: "learning_paths",
    timestamps: true,
})
export class LearningPath extends Model {
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
        type: DataType.JSONB,
        allowNull: false,
        field: 'video_sections',
        defaultValue: {
            reading: [],
            listening: [],
            writing: [],
            speaking: []
        }
    })
    declare videoSections: {
        reading: number[];
        listening: number[];
        writing: number[];
        speaking: number[];
    };

    @Column({
        type: DataType.JSONB,
        allowNull: false,
        field: 'note_sections',
        defaultValue: {
            reading: "",
            listening: "",
            writing: "",
            speaking: ""
        }
    })
    declare noteSections: {
        reading: string;
        listening: string;
        writing: string;
        speaking: string;
    };

    @Column({
        type: DataType.JSONB,
        allowNull: false,
        field: 'learning_mode_sections',
        defaultValue: {
            reading: [],
            listening: [],
            writing: [],
            speaking: []
        }
    })
    declare learningModeSections: {
        reading: any[];
        listening: any[];
        writing: any[];
        speaking: any[];
    };

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
