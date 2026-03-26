import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";

@Table({
    tableName: "videos",
    timestamps: true,
})
export class Video extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        field: 'video_link'
    })
    declare videolink: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        field: 'thumbnail_link'
    })
    declare thubnail: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
    })
    declare level: 'easy' | 'medium' | 'hard';

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
    })
    declare type: 'Writing' | 'Speaking' | 'Reading' | 'Listening';

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        field: 'exam_type',
        defaultValue: 'IELTS'
    })
    declare examType: 'IELTS' | 'TOEFL';

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
}
