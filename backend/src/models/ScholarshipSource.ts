import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Unique,
    Default,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import type { Scholarship } from "./Scholarship.js";

@Table({
    tableName: "scholarship_sources",
    timestamps: true,
})
export class ScholarshipSource extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        field: 'domain_name'
    })
    declare domainName: string;

    @Unique
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        field: 'base_url'
    })
    declare baseUrl: string;

    @Default(true)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_active'
    })
    declare isActive: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'last_scraped'
    })
    declare lastScraped: Date | null;

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

    // Association defined in associations.ts
    declare scholarships?: Scholarship[];
}
