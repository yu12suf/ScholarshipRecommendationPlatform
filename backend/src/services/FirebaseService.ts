import admin from "firebase-admin";
import configs from "../config/configs.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FirebaseService {
    private static isInitialized = false;

    private static initialize() {
        if (this.isInitialized) return;

        try {
            const serviceAccountPath = path.join(__dirname, "../config/firebase-service-account.json");
            
            if (fs.existsSync(serviceAccountPath)) {
                const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                this.isInitialized = true;
                console.log("[FirebaseService] SDK Initialized successfully.");
            } else {
                console.warn("[FirebaseService] Service account file not found at:", serviceAccountPath);
                console.warn("[FirebaseService] Push notifications will not be sent.");
            }
        } catch (error) {
            console.error("[FirebaseService] Initialization error:", error);
        }
    }

    static async sendPush(token: string, title: string, body: string, data?: any) {
        this.initialize();
        if (!this.isInitialized) return;

        try {
            const message = {
                notification: { title, body },
                token: token,
                data: data ? { ...data, scholarshipId: String(data.scholarshipId || "") } : undefined
            };

            const response = await admin.messaging().send(message);
            console.log("[FirebaseService] Successfully sent push:", response);
        } catch (error: any) {
            console.error("[FirebaseService] Error sending push:", error.message);
            // If token is invalid/expired, we could potentially clear it from the user model here
        }
    }
}
