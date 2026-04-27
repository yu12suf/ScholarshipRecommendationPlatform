import { Op, Transaction } from 'sequelize';
import { Booking } from '../models/Booking.js';
import { Order } from 'sequelize';
import { AvailabilitySlot } from '../models/AvailabilitySlot.js';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';

export class BookingRepository {
    /**
     * Find a booking by ID
     */
    static async findById(id: number): Promise<Booking | null> {
        return Booking.findByPk(id);
    }

    /**
     * Find booking by ID with associations
     */
    static async findByIdWithAssociations(id: number, includeSlot: boolean = true, transaction?: Transaction): Promise<Booking | null> {
        return Booking.findByPk(id, {
            ...(transaction ? { transaction } : {}),
            include: [
                {
                    model: AvailabilitySlot,
                    as: 'slot',
                    ...(includeSlot && { required: false })
                },
                {
                    model: Student,
                    as: 'student',
                    required: false
                }
            ]
        });
    }

    /**
     * Find all bookings for a counselor
     */
    static async findAllByCounselor(
        counselorId: number,
        filters?: {
            status?: string | string[];
            fromDate?: Date;
            toDate?: Date;
        }
    ): Promise<Booking[]> {
        const whereClause: any = { counselorId };

        if (filters?.status) {
            if (Array.isArray(filters.status)) {
                whereClause.status = { [Op.in]: filters.status };
            } else {
                whereClause.status = filters.status;
            }
        }

        if (filters?.fromDate) {
            whereClause.createdAt = { [Op.gte]: filters.fromDate };
        }

        if (filters?.toDate) {
            whereClause.createdAt = { ...whereClause.createdAt, [Op.lte]: filters.toDate };
        }

        return Booking.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']] as Order
        });
    }

    /**
     * Find upcoming bookings for a counselor
     */
    static async findUpcomingByCounselor(
        counselorId: number,
        includeAssociations: boolean = true
    ): Promise<Booking[]> {
        const now = new Date();
        const orderBy: Order = includeAssociations
            ? [[{ model: AvailabilitySlot, as: 'slot' }, 'startTime', 'ASC']]
            : [['createdAt', 'ASC']];

        return Booking.findAll({
            where: {
                counselorId,
                status: { [Op.in]: ['pending', 'confirmed', 'started', 'awaiting_confirmation'] }
            },
            include: includeAssociations ? [
                {
                    model: AvailabilitySlot,
                    as: 'slot',
                    // INNER JOIN ensures bookings without a real slot are excluded.
                    required: true,
                },
                {
                    model: Student,
                    as: 'student',
                    required: false,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                }
            ] : [],
            order: orderBy
        });
    }

    /**
     * Find bookings by student and counselor
     */
    static async findByStudentAndCounselor(
        studentId: number,
        counselorId: number
    ): Promise<Booking[]> {
        return Booking.findAll({
            where: {
                studentId,
                counselorId
            },
            order: [['createdAt', 'DESC']] as Order
        });
    }

    /**
     * Find booking by slot ID
     */
    static async findBySlotId(slotId: number): Promise<Booking | null> {
        return Booking.findOne({
            where: { slotId }
        });
    }

    /**
     * Create a new booking
     */
    static async create(data: {
        studentId: number;
        counselorId: number;
        slotId: number;
        paymentId?: number;
        status?: string;
        meetingLink?: string;
    }): Promise<Booking> {
        return Booking.create({
            studentId: data.studentId,
            counselorId: data.counselorId,
            slotId: data.slotId,
            paymentId: data.paymentId || null,
            status: data.status || 'pending',
            meetingLink: data.meetingLink || null
        });
    }

    /**
     * Update a booking
     */
    static async update(
        id: number,
        data: {
            status?: string;
            meetingLink?: string;
            startedAt?: Date | null;
            completedAt?: Date | null;
            notes?: string | null;
        }
    ): Promise<Booking | null> {
        const booking = await Booking.findByPk(id);
        if (!booking) return null;
        return booking.update(data);
    }

    /**
     * Update booking status
     */
    static async updateStatus(id: number, status: string): Promise<Booking | null> {
        const booking = await Booking.findByPk(id);
        if (!booking) return null;
        return booking.update({ status });
    }

    /**
     * Set booking started time
     */
    static async markAsStarted(id: number): Promise<Booking | null> {
        const booking = await Booking.findByPk(id);
        if (!booking) return null;
        return booking.update({
            status: 'started',
            startedAt: new Date()
        });
    }

    /**
     * Set booking completed time
     */
    static async markAsCompleted(id: number): Promise<Booking | null> {
        const booking = await Booking.findByPk(id);
        if (!booking) return null;
        return booking.update({
            status: 'completed',
            completedAt: new Date()
        });
    }

    /**
     * Cancel a booking
     */
    static async cancel(id: number): Promise<Booking | null> {
        const booking = await Booking.findByPk(id);
        if (!booking) return null;
        return booking.update({ status: 'cancelled' });
    }

    /**
     * Find booking by ID and counselor ID (ownership check)
     */
    static async findByIdAndCounselorId(
        id: number,
        counselorId: number
    ): Promise<Booking | null> {
        return Booking.findOne({
            where: {
                id,
                counselorId
            }
        });
    }

    /**
     * Find all unique students who have booked with a counselor
     */
    static async findUniqueStudentsByCounselor(counselorId: number): Promise<Booking[]> {
        return Booking.findAll({
            where: { counselorId },
            include: [
                {
                    model: Student,
                    as: 'student',
                    required: true,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']] as Order
        });
    }

    /**
     * Count bookings by counselor
     */
    static async countByCounselor(
        counselorId: number,
        status?: string
    ): Promise<number> {
        const whereClause: any = { counselorId };
        if (status) {
            whereClause.status = status;
        }
        return Booking.count({ where: whereClause });
    }
}