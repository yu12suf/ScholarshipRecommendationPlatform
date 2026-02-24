import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Unique,
    ForeignKey,
    BelongsTo,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import { ScholarshipSource } from "./ScholarshipSource.js";

@Table({
    tableName: "scholarships",
    timestamps: true,
})
export class Scholarship extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @ForeignKey(() => ScholarshipSource)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'source_id'
    })
    declare sourceId: number | null;

    @Column({
        type: DataType.STRING(512),
        allowNull: false,
    })
    declare title: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare description: string | null;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
    })
    declare amount: string | null;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    declare deadline: Date;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: 'fund_type'
    })
    declare fundType: string | null;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare requirements: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'intake_season'
    })
    declare intakeSeason: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare country: string | null;

    @Unique
    @Column({
        type: DataType.STRING(512),
        allowNull: false,
        field: 'original_url'
    })
    declare originalUrl: string;

    @Column({
        type: DataType.STRING(32), // MD5 hash is 32 chars
        allowNull: true,
        field: 'content_hash'
    })
    declare contentHash: string | null;

    // pgvector column: vector(768)
    // Note: We use DataType.ARRAY(DataType.FLOAT) for Sequelize to handle the array format.
    // The actual column type in Postgres is vector(768).
    @Column({
        type: DataType.ARRAY(DataType.FLOAT),
        allowNull: true,
    })
    declare embedding: number[] | null;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: 'created_at'
    })
    declare createdAt: Date;
    @Column(DataType.JSON) // Store as JSON array: ["Bachelor", "Master"]
    declare degreeLevels: string[];

    @UpdatedAt
    @Column({
        type: DataType.DATE,
        field: 'updated_at'
    })
    declare updatedAt: Date;

    @BelongsTo(() => ScholarshipSource)
    source!: ScholarshipSource;
}
