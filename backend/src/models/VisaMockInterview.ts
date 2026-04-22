import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Student } from "./Student.js";

@Table({
  tableName: "visa_mock_interviews",
  timestamps: true,
})
export class VisaMockInterview extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Student)
  @Column(DataType.INTEGER)
  declare studentId: number;

  @BelongsTo(() => Student)
  declare student: Student;

  @Column(DataType.STRING)
  declare country: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: true,
  })
  declare vapiCallId: string;

  @Column(DataType.JSONB)
  declare transcript: any[];

  @Column(DataType.STRING)
  declare audioUrl: string;

  @Column({
    type: DataType.ENUM("Pending", "Completed", "Evaluated", "Failed"),
    defaultValue: "Pending",
  })
  declare status: string;

  @Column(DataType.JSONB)
  declare aiEvaluation: {
    summary?: string;
    successEvaluation?: string;
    structuredData?: {
      confidence_score: number;
      detailed_feedback: string;
      country_specific_flags: string[];
      focus_areas: string[];
      improvements: string[];
      rubric_breakdown?: Record<string, number>;
      evaluation_source?: string;
    };
    [key: string]: unknown;
  };
}
