import { NotificationService } from "../services/NotificationService.js";
import { ScholarshipRepository } from "../repositories/ScholarshipRepository.js";
import { User } from "../models/User.js";
import { connectSequelize, sequelize } from "../config/sequelize.js";
import { UserRole } from "../types/userTypes.js";

async function testNotificationBroadcast() {
    console.log("--- Starting Notification Broadcast Test ---");
    
    try {
        await connectSequelize();

        // 1. Create/Ensure multiple test students
        const testEmails = ['student_a@example.com', 'student_b@example.com'];
        const studentIds: number[] = [];

        for (const email of testEmails) {
            let user = await User.findOne({ where: { email } });
            if (!user) {
                console.log(`Creating test student: ${email}`);
                user = await User.create({
                    name: `Test Student ${email.split('@')[0]}`,
                    email: email,
                    password: "password123",
                    role: UserRole.STUDENT
                });
            }
            studentIds.push(user.id);
        }

        // 2. Mock a new scholarship ingestion (Simulating ScholarshipDiscoveryService logic)
        console.log("Mocking a new scholarship ingestion...");
        const scholarshipTitle = "Broadcast Test Scholarship " + Date.now();
        const scholarshipUrl = "https://example.com/test-scholarship-" + Date.now();
        
        const scholarshipData: any = {
            title: scholarshipTitle,
            description: "A great opportunity for everyone!",
            originalUrl: scholarshipUrl,
            amount: "1000",
            fundType: "Partial",
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            contentHash: "hash_" + Date.now(),
            embedding: `[${Array(3072).fill(0.1).join(',')}]`
        };

        const [upsertedScholarship] = await ScholarshipRepository.upsert(scholarshipData);
        console.log(`Scholarship upserted with ID: ${upsertedScholarship.id}`);

        // 3. BROADCAST LOGIC (Copied from ScholarshipDiscoveryService for verification)
        console.log(`[BROADCAST] Notifying all students about: ${scholarshipTitle}`);
        const students = await User.findAll({
            where: { role: UserRole.STUDENT },
            attributes: ['id']
        });

        console.log(`Found ${students.length} students to notify.`);
        
        for (const student of students) {
            await NotificationService.createNotification(
                student.id,
                "New Scholarship Available!",
                `A new scholarship "${scholarshipTitle}" is now available. View it here: ${scholarshipUrl}`,
                "SCHOLARSHIP_MATCH",
                upsertedScholarship.id
            );
        }

        // 4. VERIFY
        console.log("Verifying notifications in database...");
        for (const userId of studentIds) {
            const notifs = await NotificationService.getUserNotifications(userId);
            const latest = notifs[0]; // Should be the one we just created
            
            if (latest && latest.message.includes(scholarshipUrl) && latest.relatedId === upsertedScholarship.id) {
                console.log(`SUCCESS: Student ${userId} received correct linked notification.`);
            } else {
                console.error(`FAILURE: Student ${userId} missing or incorrect notification!`);
                console.log("Latest notif:", latest ? JSON.stringify(latest, null, 2) : "None");
            }
        }

    } catch (error) {
        console.error("Test failed with error:", error);
    } finally {
        await sequelize.close();
        console.log("--- Test Complete ---");
        process.exit(0);
    }
}

testNotificationBroadcast();
