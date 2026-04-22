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

    static async untrackScholarship(studentId: number, scholarshipId: number): Promise<void> {
        const result = await ScholarshipTrackingRepository.untrackScholarship(studentId, scholarshipId);
        if (result === 0) {
            throw new Error("Scholarship not found in watchlist");
        }
    }

    static async getWatchlist(studentId: number, userId: number): Promise<any[]> {
        const watchlist = await ScholarshipTrackingRepository.getTrackedScholarships(studentId);
        
        // Hydrate matches for each tracked item to avoid 0% scores
        const { MatchingService } = await import("./MatchingService.js");
        const hydrated = await Promise.all(watchlist.map(async (item) => {
            const plainItem = item.toJSON();
            try {
                // Use the userId passed from controller for matching consistency
                const matchData = await MatchingService.getMatchById(userId, plainItem.scholarshipId);
                if (matchData && plainItem.scholarship) {
                    plainItem.scholarship.matchScore = matchData.matchScore;
                    plainItem.scholarship.matchReason = matchData.matchReason;
                }
            } catch (err) {
                console.warn(`[Watchlist] Failed to hydrate match for ${item.scholarshipId}:`, err);
            }
            return plainItem;
        }));

        // Sort by match score descending so top matches are first
        hydrated.sort((a, b) => {
            const scoreA = a.scholarship?.matchScore ?? 0;
            const scoreB = b.scholarship?.matchScore ?? 0;
            return scoreB - scoreA;
        });

        return hydrated;
    }

    static async updateDeadline(id: number, studentId: number, manualDeadline: Date): Promise<TrackedScholarship> {
        const [count, results] = await ScholarshipTrackingRepository.updateTrackedScholarship(id, studentId, { manualDeadline });
        if (count === 0 || !results || results.length === 0) throw new Error("Tracked scholarship not found");
        return results[0] as TrackedScholarship;
    }

    static async updateStatus(id: number, studentId: number, status: string): Promise<TrackedScholarship> {
        // First try finding by tracking record PK, then by scholarshipId
        let tracked = await ScholarshipTrackingRepository.findTrackedById(id, studentId);
        if (!tracked) {
            tracked = await ScholarshipTrackingRepository.findByScholarshipId(studentId, id);
        }

        if (!tracked) throw new Error("Tracked scholarship not found");

        const [count, results] = await ScholarshipTrackingRepository.updateTrackedScholarship(tracked.id, studentId, { status });
        if (count === 0 || !results || results.length === 0) throw new Error("Update failed");
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

    static async getDashboardStats(studentId: number) {
        const tracked = await ScholarshipTrackingRepository.getTrackedScholarships(studentId);
        
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const savedCount = tracked.filter(t => ['NOT_STARTED', 'WATCHING'].includes(t.status)).length;
        const appliedCount = tracked.filter(t => ['APPLIED', 'SUBMITTED', 'ACCEPTED'].includes(t.status)).length;
        const deadlineCount = tracked.filter(t => {
            const deadline = t.manualDeadline || t.scholarship?.deadline;
            if (!deadline) return false;
            const dDate = new Date(deadline);
            return dDate >= now && dDate <= thirtyDaysFromNow;
        }).length;

        return {
            savedCount,
            appliedCount,
            deadlineCount,
            // Add 'metrics' for mobile parity
            metrics: {
                saved: savedCount,
                applied: appliedCount,
                dueSoon: deadlineCount
            }
        };
    }
}
