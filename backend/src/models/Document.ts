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
import { Counselor } from "./Counselor.js";

@Table({
  tableName: "documents",
  timestamps: true,
})
export class Document extends Model {
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
    field: "student_id",
    onDelete: 'CASCADE'
  })
  declare studentId: number;

  @ForeignKey(() => Counselor)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "counselor_id",
    onDelete: 'CASCADE'
  })
  declare counselorId: number | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: "document_type",
  })
  declare documentType: "sop" | "cv" | "lor" | "transcript" | "other";

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: "file_url",
  })
  declare fileUrl: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: "counselor_feedback",
  })
  declare counselorFeedback: string | null;

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

  @BelongsTo(() => Student)
  student!: Student;

  @BelongsTo(() => Counselor)
  counselor!: Counselor;
}
