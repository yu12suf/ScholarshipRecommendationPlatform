import { ScholarshipTrackingRepository } from "../repositories/ScholarshipTrackingRepository.js";
import { TrackedScholarship } from "../models/TrackedScholarship.js";
import { ScholarshipMilestone } from "../models/ScholarshipMilestone.js";

export class ScholarshipTrackingService {
    static async trackScholarship(studentId: number, scholarshipId: number): Promise<TrackedScholarship> {
        // Check if already tracked
        const existing = await ScholarshipTrackingRepository.findByScholarshipId(studentId, scholarshipId);
        if (existing) {
            throw new Error("Scholarship already in watchlist");
        }
        return ScholarshipTrackingRepository.trackScholarship(studentId, scholarshipId);
    }

    static async getWatchlist(studentId: number): Promise<TrackedScholarship[]> {
        return ScholarshipTrackingRepository.getTrackedScholarships(studentId);
    }

    static async updateDeadline(id: number, studentId: number, manualDeadline: Date): Promise<TrackedScholarship> {
        const [count, results] = await ScholarshipTrackingRepository.updateTrackedScholarship(id, studentId, { manualDeadline });
        if (count === 0 || !results || results.length === 0) throw new Error("Tracked scholarship not found");
        return results[0] as TrackedScholarship;
    }

    static async updateStatus(id: number, studentId: number, status: string): Promise<TrackedScholarship> {
        const [count, results] = await ScholarshipTrackingRepository.updateTrackedScholarship(id, studentId, { status });
        if (count === 0 || !results || results.length === 0) throw new Error("Tracked scholarship not found");
        return results[0] as TrackedScholarship;
    }

    static async updateNotificationSettings(id: number, studentId: number, leadTime: number): Promise<TrackedScholarship> {
        const [count, results] = await ScholarshipTrackingRepository.updateTrackedScholarship(id, studentId, { notificationLeadTime: leadTime });
        if (count === 0 || !results || results.length === 0) throw new Error("Tracked scholarship not found");
        return results[0] as TrackedScholarship;
    }

    static async addMilestone(id: number, studentId: number, milestoneData: Partial<ScholarshipMilestone>): Promise<ScholarshipMilestone> {
        const tracked = await ScholarshipTrackingRepository.findTrackedById(id, studentId);
        if (!tracked) throw new Error("Tracked scholarship not found");
        
        return ScholarshipTrackingRepository.addMilestone(id, milestoneData);
    }

    static async getMilestones(id: number, studentId: number): Promise<ScholarshipMilestone[]> {
        const tracked = await ScholarshipTrackingRepository.findTrackedById(id, studentId);
        if (!tracked) throw new Error("Tracked scholarship not found");

        return ScholarshipTrackingRepository.getMilestones(id);
    }

    static async toggleMilestone(milestoneId: number, studentId: number, isCompleted: boolean): Promise<ScholarshipMilestone> {
        // Find milestone and verify ownership via TrackedScholarship
        const milestone = await ScholarshipMilestone.findByPk(milestoneId, {
            include: [{ model: TrackedScholarship }]
        });

        if (!milestone || milestone.trackedScholarship.studentId !== studentId) {
            throw new Error("Milestone not found or unauthorized");
        }

        const [count, results] = await ScholarshipTrackingRepository.updateMilestone(milestoneId, milestone.trackedScholarshipId, { isCompleted });
        if (count === 0 || !results || results.length === 0) throw new Error("Update failed");
        return results[0] as ScholarshipMilestone;
    }

    static async getCalendarDeadlines(studentId: number) {
        const tracked = await ScholarshipTrackingRepository.getTrackedScholarships(studentId);
        const events: any[] = [];

        tracked.forEach(ts => {
            // Main deadline
            if (ts.manualDeadline) {
                events.push({
                    id: `main-${ts.id}`,
                    title: `${ts.scholarship?.title} - Application Deadline`,
                    date: ts.manualDeadline,
                    type: 'DEADLINE',
                    status: ts.status,
                    scholarshipId: ts.scholarshipId
                });
            } else if (ts.scholarship?.deadline) {
                events.push({
                    id: `main-${ts.id}`,
                    title: `${ts.scholarship?.title} - Original Deadline`,
                    date: ts.scholarship.deadline,
                    type: 'DEADLINE',
                    status: ts.status,
                    scholarshipId: ts.scholarshipId
                });
            }

            // Milestones
            ts.milestones?.forEach(m => {
                events.push({
                    id: `milestone-${m.id}`,
                    title: `${ts.scholarship?.title} - ${m.name}`,
                    date: m.deadline,
                    type: m.type,
                    description: m.description,
                    isCompleted: m.isCompleted,
                    scholarshipId: ts.scholarshipId
                });
            });
        });

        return events;
    }
}
