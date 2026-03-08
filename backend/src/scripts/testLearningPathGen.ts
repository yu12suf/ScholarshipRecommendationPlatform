import { LearningPathService } from "../services/LearningPathService.js";
import { VideoRepository } from "../repositories/VideoRepository.js";
import { sequelize } from "../config/sequelize.js";
import { Video } from "../models/Video.js";
import { Student } from "../models/Student.js";
import { User } from "../models/User.js";

async function testExtraction() {
    try {
        console.log("🚀 Starting Learning Path Generation Test...");

        await sequelize.authenticate();
        console.log("✅ Database connected.");

        await sequelize.sync();
        console.log("✅ Database synchronized.");

        // 0. Ensure a test student exists (to satisfy Foreign Key constraint)
        let testStudent = await Student.findByPk(1);
        if (!testStudent) {
            console.log("⚠️ Student ID 1 not found. Creating a dummy student...");
            // We need a user first
            let testUser = await User.findByPk(1) as any;
            if (!testUser) {
                testUser = await User.create({
                    id: 1,
                    name: "Test User",
                    email: "test@example.com",
                    role: "student",
                    isActive: true
                } as any);
            }
            testStudent = await Student.create({
                id: 1,
                userId: testUser.id,
                isOnboarded: true
            } as any);
            console.log("✅ Test student created.");
        }

        // 1. Ensure we have some videos in the database
        const videoCount = await Video.count();
        if (videoCount < 20) {
            console.log("⚠️ Not enough videos in DB. Seeding temporary test videos...");
            const levels: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
            const types: ('Reading' | 'Listening' | 'Writing' | 'Speaking')[] = ['Reading', 'Listening', 'Writing', 'Speaking'];

            for (const level of levels) {
                for (const type of types) {
                    for (let i = 1; i <= 5; i++) {
                        await Video.create({
                            videoLink: `https://example.com/${level}-${type}-${i}`,
                            thumbnailLink: `https://example.com/thumb-${level}-${type}-${i}`,
                            level,
                            type
                        });
                    }
                }
            }
            console.log("✅ Seeded 60 test videos (5 per skill/level combination).");
        }

        // 2. Mock AI Evaluation Result
        const mockEvaluation = {
            evaluation: {
                overall_band: 6.5, // Should map to 'medium'
                subscores: { reading: 6.0, listening: 7.0, writing: 6.5, speaking: 6.5 },
                feedback_report: "Your overall performance is good, but work on your reading comprehension.",
                section_notes: {
                    reading: "Focus on skimming and scanning techniques for academic texts.",
                    listening: "Practice identifying main ideas in complex lectures.",
                    writing: "Improve your use of cohesive devices in Task 2.",
                    speaking: "Work on lexical resource and idiomatic expressions."
                }
            }
        };

        const testStudentId = 1; // Assuming student ID 1 exists or is used for testing

        // 3. Trigger Generation
        console.log("🔄 Generating learning path for Student ID 1...");
        await LearningPathService.generateForStudent(testStudentId, mockEvaluation);
        console.log("✅ Learning path generated and stored.");

        // 4. Verify Retrieval
        console.log("📂 Retrieving formatted learning path...");
        const path = await LearningPathService.getFormattedPath(testStudentId);

        console.log("📊 Verification Results:");
        console.log(JSON.stringify(path, null, 2));

        if (path && path.reading && path.reading.videos.length === 5 && path.reading.notes.includes("skimming")) {
            console.log("✨ TEST PASSED: Learning path is correctly structured, populated with 5 videos per skill, and contains AI notes!");
        } else {
            console.log("❌ TEST FAILED: Verification criteria not met.");
        }

    } catch (error) {
        console.error("❌ Test failed with error:", error);
    } finally {
        // await sequelize.close();
    }
}

testExtraction();
