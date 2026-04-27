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
    indexes: [
        { fields: ["country"] },
        { fields: ["fund_type"] },
        { fields: ["degree_levels"], using: "GIN" },
        { fields: ["source_id"] }
    ]
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

    // pgvector column: vector(3072)
    // Note: We use DataType.ARRAY(DataType.FLOAT) for Sequelize to handle the array format.
    // The actual column type in Postgres is vector(3072).
    // Note: We use DataType.JSONB for maximum compatibility without pgvector extension.
    // If pgvector is installed, this can be changed to 'VECTOR(3072)' for optimized search.
    @Column({
        type: 'VECTOR(3072)',
        allowNull: true,
        set(value: number[] | string | null) {
            if (Array.isArray(value)) {
                this.setDataValue('embedding', `[${value.join(',')}]`);
            } else {
                this.setDataValue('embedding', value);
            }
        }
    })
    declare embedding: any;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: 'created_at'
    })
    declare createdAt: Date;
    @Column({
        type: DataType.JSONB,
        field: 'degree_levels'
    }) // Store as JSON array: ["Bachelor", "Master"]
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
