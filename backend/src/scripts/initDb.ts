import { Client } from "pg";
import { createTables, seedAdminUser, seedSampleUsers } from "../utils/databaseMigration.js";
import configs from "../config/configs.js";

const initDB = async () => {
    const dbName = configs.DB_NAME;

    console.log(`Checking if database '${dbName}' exists...`);

    // Connect to default 'postgres' database to create the new DB
    const client = new Client({
        host: configs.DB_HOST,
        port: configs.DB_PORT,
        user: configs.DB_USER,
        password: configs.DB_PASSWORD,
        database: "postgres",
    });

    try {
        await client.connect();

        // Check if database exists
        const res = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );

        if (res.rowCount === 0) {
            console.log(`Database '${dbName}' does not exist. Creating...`);
            // Cannot use parameterized query for CREATE DATABASE
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }
    } catch (error) {
        console.error("Error creating database:", error);
        process.exit(1);
    } finally {
        await client.end();
    }

    // Now verify tables and seed data
    console.log("Initializing tables and seed data...");
    try {
        await createTables();
        await seedAdminUser();
        await seedSampleUsers();
        console.log("Database initialization complete!");
        process.exit(0);
    } catch (error) {
        console.error("Error initializing tables:", error);
        process.exit(1);
    }
};

initDB();
