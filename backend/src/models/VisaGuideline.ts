import { Table, Column, Model, DataType, PrimaryKey, Default } from "sequelize-typescript";

@Table({
  tableName: "visa_guidelines",
  timestamps: true,
})
export class VisaGuideline extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  declare country: string;

  @Column(DataType.STRING)
  declare visaType: string;

  @Column(DataType.JSONB)
  declare requiredDocuments: string[];

  @Column(DataType.JSONB)
  declare commonQuestions: string[];
}
