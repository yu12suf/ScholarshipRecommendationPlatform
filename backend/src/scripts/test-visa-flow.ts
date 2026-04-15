import { VisaService } from "../services/VisaService.js";
import { VisaMockInterview } from "../models/VisaMockInterview.js";
import { Student } from "../models/Student.js";
import { User } from "../models/User.js";
import configs from "../config/configs.js";
import axios from "axios";
import { connectSequelize } from "../config/sequelize.js";
import { randomUUID } from "crypto";

async function runTest() {
    console.log("Initializing Test Database...");
    await connectSequelize();

    console.log("Starting Visa Flow Test...");

    // Find a student
    const student = await Student.findOne({ include: [User] });
    if (!student) {
        console.error("❌ No student found in database. Cannot run test.");
        process.exit(1);
    }

    const studentInfo = {
        studentId: student.id,
        studentName: student.user?.name || "Test Student",
        university: student.currentUniversity || "Stanford University",
        country: "USA"
    };

    try {
        const initResult = await VisaService.initiateCall(studentInfo);
        console.log("Call Initiated:", initResult);
        const { interviewId } = initResult;

        // 2. Mock Vapi Webhook: call-start
        const webhookUrl = `${configs.SERVER_URL}/api/visa/webhook/vapi`;
        console.log(`Sending mock 'call-start' to ${webhookUrl}`);

        const mockCallId = `mock-vapi-call-${randomUUID()}`;

        const callStartPayload = {
            message: {
                type: "call-start",
                call: { id: mockCallId },
                metadata: { interviewId }
            }
        };

        await axios.post(webhookUrl, callStartPayload);
        console.log("Mock 'call-start' sent.");

        // Verify DB update
        const interview = await VisaMockInterview.findByPk(interviewId);
        if (interview?.vapiCallId === mockCallId) {
            console.log("✅ SUCCESS: vapiCallId linked correctly.");
        } else {
            console.log("❌ FAILURE: vapiCallId not linked.");
        }

        // 3. Mock Vapi Webhook: end-of-call-report
        console.log("Sending mock 'end-of-call-report'...");
        const endCallPayload = {
            message: {
                type: "end-of-call-report",
                call: { id: mockCallId },
                transcript: [
                    { role: "assistant", text: "Pass me your passport. What is the purpose of your trip?" },
                    { role: "user", text: "I am going to study Computer Science at Stanford." },
                    { role: "assistant", text: "How will you fund your studies?" },
                    { role: "user", text: "My parents are sponsoring me, they have 100k in savings." }
                ],
                recordingUrl: "https://example.com/recording.mp3"
            }
        };

        await axios.post(webhookUrl, endCallPayload);
        console.log("Mock 'end-of-call-report' sent.");

        // Wait for evaluation (it's async in the controller, but we can wait a bit)
        setTimeout(async () => {
            const updatedInterview = await VisaMockInterview.findByPk(interviewId);
            if (updatedInterview?.status === "Evaluated") {
                console.log("✅ SUCCESS: Interview evaluated correctly.");
                console.log("AI Evaluation:", JSON.stringify(updatedInterview.aiEvaluation, null, 2));
            } else {
                console.log("❌ FAILURE: Interview status is not 'Evaluated'. Current status:", updatedInterview?.status);
            }
            process.exit(0);
        }, 5000);

    } catch (error: any) {
        console.error("Test failed:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        process.exit(1);
    }
}

runTest();
