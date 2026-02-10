import { AuthService } from "../services/AuthService.js";
import { connectSequelize } from "../config/sequelize.js";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
    try {
        await connectSequelize();
        console.log("Attempting login for josefdagne5@gmail.com with Admin@123...");
        const result = await AuthService.login({
            email: "josefdagne5@gmail.com",
            password: "Admin@123"
        });
        console.log("Login successful!");
        console.log("Result:", JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (error: any) {
        console.error("Login failed:", error.message);
        process.exit(1);
    }
}

runTest();
