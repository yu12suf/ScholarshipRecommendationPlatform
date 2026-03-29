import { TrackedScholarship } from "../models/TrackedScholarship.js";
import { ScholarshipMilestone } from "../models/ScholarshipMilestone.js";
import { Scholarship } from "../models/Scholarship.js";

export class ScholarshipTrackingRepository {
    static async trackScholarship(studentId: number, scholarshipId: number): Promise<TrackedScholarship> {
        return TrackedScholarship.create({ studentId, scholarshipId });
    }

    static async getTrackedScholarships(studentId: number): Promise<TrackedScholarship[]> {
        return TrackedScholarship.findAll({
            where: { studentId },
            include: [
                { model: Scholarship },
                { model: ScholarshipMilestone }
            ]
        });
    }

    static async updateTrackedScholarship(id: number, studentId: number, data: Partial<TrackedScholarship>): Promise<[number, TrackedScholarship[]]> {
        return TrackedScholarship.update(data, {
            where: { id, studentId },
            returning: true
        });
    }

    static async addMilestone(trackedScholarshipId: number, data: Partial<ScholarshipMilestone>): Promise<ScholarshipMilestone> {
        return ScholarshipMilestone.create({ ...data, trackedScholarshipId });
    }

    static async updateMilestone(id: number, trackedScholarshipId: number, data: Partial<ScholarshipMilestone>): Promise<[number, ScholarshipMilestone[]]> {
        return ScholarshipMilestone.update(data, {
            where: { id, trackedScholarshipId },
            returning: true
        });
    }

    static async getMilestones(trackedScholarshipId: number): Promise<ScholarshipMilestone[]> {
        return ScholarshipMilestone.findAll({
            where: { trackedScholarshipId }
        });
    }

    static async findTrackedById(id: number, studentId: number): Promise<TrackedScholarship | null> {
        return TrackedScholarship.findOne({
            where: { id, studentId },
            include: [Scholarship, ScholarshipMilestone]
        });
    }

    static async findByScholarshipId(studentId: number, scholarshipId: number): Promise<TrackedScholarship | null> {
        return TrackedScholarship.findOne({
            where: { studentId, scholarshipId }
        });
    }
}
