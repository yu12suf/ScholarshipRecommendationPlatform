import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";

@Table({
    tableName: "pdfs",
    timestamps: true,
})
export class Pdf extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        field: 'title'
    })
    declare title: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        field: 'pdf_link'
    })
    declare pdfLink: string;

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
