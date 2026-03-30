import { TrackedScholarship } from "../models/TrackedScholarship.js";
import { ScholarshipMilestone } from "../models/ScholarshipMilestone.js";
import { Scholarship } from "../models/Scholarship.js";
import { Student } from "../models/Student.js";
import { Notification } from "../models/Notification.js";
import { Op } from "sequelize";

export class DeadlineReminderService {
    static async checkAndSendReminders() {
        console.log("Checking for approaching deadlines and milestones...");
        const now = new Date();

        // 1. Check TrackedScholarships
        const trackedScholarships = await TrackedScholarship.findAll({
            where: {
                status: { [Op.notIn]: ['SUBMITTED', 'AWARDED'] }
            },
            include: [Scholarship, { model: Student, include: ['user'] }]
        });

        for (const ts of trackedScholarships) {
            const deadline = ts.manualDeadline || ts.scholarship?.deadline;
            if (!deadline) continue;

            const leadTimeMs = ts.notificationLeadTime * 24 * 60 * 60 * 1000;
            const reminderThreshold = new Date(deadline.getTime() - leadTimeMs);

            if (now >= reminderThreshold && now < deadline) {
                // Check if notification already sent today
                const alreadySent = await Notification.findOne({
                    where: {
                        userId: ts.student.userId,
                        type: 'DEADLINE_REMINDER',
                        relatedId: ts.id,
                        createdAt: { [Op.gte]: new Date(now.setHours(0, 0, 0, 0)) }
                    }
                });

                if (!alreadySent) {
                    await Notification.create({
                        userId: ts.student.userId,
                        title: "Upcoming Scholarship Deadline",
                        message: `The deadline for ${ts.scholarship?.title} is approaching on ${deadline.toLocaleDateString()}.`,
                        type: 'DEADLINE_REMINDER',
                        relatedId: ts.id
                    });
                    console.log(`Sent deadline reminder for TS ${ts.id} to user ${ts.student.userId}`);
                }
            }
        }

        // 2. Check Milestones
        const milestones = await ScholarshipMilestone.findAll({
            where: { isCompleted: false },
            include: [{ model: TrackedScholarship, include: [Scholarship, { model: Student, include: ['user'] }] }]
        });

        for (const m of milestones) {
            const deadline = m.deadline;
            // For milestones, we might want a fixed lead time or use the TS lead time
            const leadTimeMs = 1 * 24 * 60 * 60 * 1000; // 1 day before for milestones by default
            const reminderThreshold = new Date(deadline.getTime() - leadTimeMs);

            if (now >= reminderThreshold && now < deadline) {
                const ts = m.trackedScholarship;
                const alreadySent = await Notification.findOne({
                    where: {
                        userId: ts.student.userId,
                        type: 'MILESTONE_REMINDER',
                        relatedId: m.id,
                        createdAt: { [Op.gte]: new Date(now.setHours(0, 0, 0, 0)) }
                    }
                });

                if (!alreadySent) {
                    await Notification.create({
                        userId: ts.student.userId,
                        title: "Upcoming Milestone",
                        message: `Your milestone "${m.name}" for ${ts.scholarship?.title} is due on ${deadline.toLocaleDateString()}.`,
                        type: 'MILESTONE_REMINDER',
                        relatedId: m.id
                    });
                    console.log(`Sent milestone reminder for M ${m.id} to user ${ts.student.userId}`);
                }
            }
        }
    }
}
