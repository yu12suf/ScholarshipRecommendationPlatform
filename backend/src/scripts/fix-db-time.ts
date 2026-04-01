import { sequelize } from "../config/sequelize.js";

async function runMigration() {
    console.log("Starting Database Timezone Fix...");
    try {
        await sequelize.authenticate();
        console.log("Connected to database.");

        const columnsToFix = [
            ['password_reset_tokens', 'expires_at'],
            ['password_reset_tokens', 'created_at'],
            ['refresh_tokens', 'expires_at'],
            ['refresh_tokens', 'created_at'],
            ['users', 'created_at'],
            ['users', 'updated_at']
        ];

        for (const [table, column] of columnsToFix) {
            console.log(`Fixing ${table}.${column}...`);
            // This query converts the column to TIMESTAMPTZ while assuming the current data is UTC
            await sequelize.query(`
        ALTER TABLE ${table} 
        ALTER COLUMN ${column} TYPE TIMESTAMPTZ 
        USING ${column} AT TIME ZONE 'UTC';
      `);
        }

        console.log("Database migration complete! Timezones are now handled correctly.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

runMigration();
