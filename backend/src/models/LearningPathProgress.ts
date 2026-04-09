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
import { Video } from "./Video.js";

@Table({
    tableName: "learning_path_progress",
    timestamps: true,
})
export class LearningPathProgress extends Model {
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

    @ForeignKey(() => Video)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'video_id'
    })
    declare videoId: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'question_index'
    })
    declare questionIndex: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_note'
    })
    declare isNote: boolean;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
    })
    declare section: 'Reading' | 'Listening' | 'Writing' | 'Speaking';

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: 'answer_text'
    })
    declare answerText: string;

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

    @BelongsTo(() => Student)
    student!: Student;

    @BelongsTo(() => Video)
    video!: Video;
}
