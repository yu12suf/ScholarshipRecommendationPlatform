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
  tableName: "counselor_messages",
  timestamps: true,
})
export class CounselorMessage extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

@Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "sender_user_id",
})
declare senderUserId: number;

@Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "recipient_user_id",
})
declare recipientUserId: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: "body",
  })
  declare body: string;

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

// Associations defined in associations.ts
  declare sender?: User;
  declare recipient?: User;
}
