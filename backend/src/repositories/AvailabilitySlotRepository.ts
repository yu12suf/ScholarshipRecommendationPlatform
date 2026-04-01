import { Op } from 'sequelize';
import { AvailabilitySlot } from '../models/AvailabilitySlot.js';
import { Order } from 'sequelize';

export class AvailabilitySlotRepository {
    /**
     * Find a slot by ID
     */
    static async findById(id: number): Promise<AvailabilitySlot | null> {
        if (!id || id <= 0) return null;
        return AvailabilitySlot.findByPk(id);
    }

    /**
     * Find all slots for a counselor with optional filters
     */
    static async findAllByCounselor(
        counselorId: number,
        filters?: {
            fromDate?: Date;
            toDate?: Date;
            status?: string;
        }
    ): Promise<AvailabilitySlot[]> {
        const whereClause: any = { counselorId };

        if (filters?.fromDate) {
            whereClause.startTime = { [Op.gte]: filters.fromDate };
        }

        if (filters?.toDate) {
            whereClause.endTime = { [Op.lte]: filters.toDate };
        }

        if (filters?.status && ['available', 'booked', 'cancelled'].includes(filters.status)) {
            whereClause.status = filters.status;
        }

        return AvailabilitySlot.findAll({
            where: whereClause,
            order: [['startTime', 'ASC']] as Order
        });
    }

    /**
     * Find overlapping slots for a counselor
     */
    static async findOverlappingSlots(
        counselorId: number,
        startTime: Date,
        endTime: Date,
        excludeSlotId?: number
    ): Promise<AvailabilitySlot | null> {
        return AvailabilitySlot.findOne({
            where: {
                counselorId,
                ...(excludeSlotId && { id: { [Op.ne]: excludeSlotId } }),
                status: { [Op.ne]: 'cancelled' },
                [Op.or]: [
                    {
                        [Op.and]: [
                            { startTime: { [Op.lte]: startTime } },
                            { endTime: { [Op.gt]: startTime } }
                        ]
                    },
                    {
                        [Op.and]: [
                            { startTime: { [Op.lt]: endTime } },
                            { endTime: { [Op.gte]: endTime } }
                        ]
                    },
                    {
                        [Op.and]: [
                            { startTime: { [Op.gte]: startTime } },
                            { endTime: { [Op.lte]: endTime } }
                        ]
                    }
                ]
            }
        });
    }

    /**
     * Create a new availability slot
     */
    static async create(data: {
        counselorId: number;
        startTime: Date;
        endTime: Date;
        status?: string;
    }): Promise<AvailabilitySlot> {
        return AvailabilitySlot.create({
            counselorId: data.counselorId,
            startTime: data.startTime,
            endTime: data.endTime,
            status: data.status || 'available'
        });
    }

    /**
     * Bulk create availability slots
     */
    static async bulkCreate(data: Array<{
        counselorId: number;
        startTime: Date;
        endTime: Date;
        status?: string;
    }>): Promise<AvailabilitySlot[]> {
        const slotsData = data.map(slot => ({
            counselorId: slot.counselorId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: slot.status || 'available'
        }));
        return AvailabilitySlot.bulkCreate(slotsData);
    }

    /**
     * Update a slot
     */
    static async update(
        id: number,
        data: {
            startTime?: Date;
            endTime?: Date;
            status?: string;
            reservedStudentId?: number | null;
            meetingLink?: string | null;
        }
    ): Promise<AvailabilitySlot | null> {
        const slot = await AvailabilitySlot.findByPk(id);
        if (!slot) return null;
        return slot.update(data);
    }

    /**
     * Update slot status by ID
     */
    static async updateStatus(id: number, status: string): Promise<AvailabilitySlot | null> {
        const slot = await AvailabilitySlot.findByPk(id);
        if (!slot) return null;
        return slot.update({ status });
    }

    /**
     * Soft delete a slot by setting status to cancelled
     */
    static async softDelete(id: number): Promise<AvailabilitySlot | null> {
        const slot = await AvailabilitySlot.findByPk(id);
        if (!slot) return null;
        return slot.update({ status: 'cancelled' });
    }

    /**
     * Find slot by ID and counselor ID (ownership check)
     */
    static async findByIdAndCounselorId(
        id: number,
        counselorId: number
    ): Promise<AvailabilitySlot | null> {
        return AvailabilitySlot.findOne({
            where: {
                id,
                counselorId
            }
        });
    }

    /**
     * Find booked slots by counselor ID
     */
    static async findBookedSlots(counselorId: number): Promise<AvailabilitySlot[]> {
        return AvailabilitySlot.findAll({
            where: {
                counselorId,
                status: 'booked'
            },
            order: [['startTime', 'ASC']] as Order
        });
    }
}