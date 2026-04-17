import { Op } from 'sequelize';
import { Booking } from '../models/Booking.js';
import { Order } from 'sequelize';
import { AvailabilitySlot } from '../models/AvailabilitySlot.js';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { Counselor } from '../models/Counselor.js';

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
    static async findByIdWithAssociations(id: number, includeSlot: boolean = true): Promise<Booking | null> {
        return Booking.findByPk(id, {
            include: [
                {
                    model: AvailabilitySlot,
                    as: 'slot',
                    ...(includeSlot && { required: false })
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
                },
                {
                    model: Counselor,
                    as: 'counselor',
                    required: false,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
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

        const bookings = await Booking.findAll({
            where: {
                counselorId,
                status: { [Op.in]: ['confirmed', 'started'] }
            },
            include: includeAssociations ? [
                {
                    model: AvailabilitySlot,
                    as: 'slot',
                    required: false
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
            order: [['createdAt', 'ASC']] as Order
        });
        
        // If slot association not loaded properly, fetch manually (same issue as student list)
        const needsSlotFetch = bookings.some(b => !(b as any).slot);
        if (bookings.length > 0 && needsSlotFetch) {
            const slotIds = [...new Set(bookings.map(b => b.slotId).filter(Boolean))];
            if (slotIds.length > 0) {
                console.log('[BookingRepository] Manual fetch upcoming slots, slotIds:', slotIds);
                const slots = await AvailabilitySlot.findAll({
                    where: { id: { [Op.in]: slotIds } }
                });
                const slotMap = new Map();
                slots.forEach((s: any) => slotMap.set(s.id, s));
                
                for (const booking of bookings) {
                    if (booking.slotId) {
                        (booking as any).slot = slotMap.get(booking.slotId);
                    }
                }
            }
        }
        
        // Also fetch students manually if not loaded properly
        const needsStudentFetch = bookings.some(b => {
            const student = (b as any).student;
            return !student || !student.user;
        });
        if (bookings.length > 0 && needsStudentFetch) {
            const studentIds = [...new Set(bookings.map(b => b.studentId).filter(Boolean))];
            if (studentIds.length > 0) {
                console.log('[BookingRepository] Manual fetch upcoming students, studentIds:', studentIds);
                const students = await Student.findAll({
                    where: { id: { [Op.in]: studentIds } },
                    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
                });
                console.log('[BookingRepository] Fetched students count:', students.length);
                
                const studentMap = new Map();
                for (const s of students) {
                    const sAny = s as any;
                    const userData = sAny.dataValues?.user || sAny.user?.dataValues;
                    console.log('[BookingRepository] Student', s.id, 'user from dataValues:', sAny.dataValues?.user ? 'yes' : 'no');
                    console.log('[BookingRepository] Student', s.id, 'userData:', userData);
                    const studentWithUser = { ...s.dataValues, user: userData };
                    studentMap.set(s.id, studentWithUser);
                }
                
                for (const booking of bookings) {
                    if (booking.studentId) {
                        (booking as any).student = studentMap.get(booking.studentId);
                    }
                }
            }
        }
        
        return bookings;
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
    static async findUniqueStudentsByCounselor(
        counselorId: number,
        options?: {
            status?: string | string[];
            limit?: number;
            offset?: number;
            includeBookingHistory?: boolean;
        }
    ): Promise<{ students: any[]; total: number }> {
        console.log('[BookingRepository] findUniqueStudentsByCounselor called, counselorId:', counselorId, 'options:', options);
        
        const whereClause: any = { counselorId };
        
        if (options?.status) {
            if (Array.isArray(options.status)) {
                whereClause.status = { [Op.in]: options.status };
            } else {
                whereClause.status = options.status;
            }
        }

        const limit = options?.limit || 20;
        const offset = options?.offset || 0;

        console.log('[BookingRepository] Where clause:', JSON.stringify(whereClause));

        const allBookingsForCounselor = await Booking.findAll({
            where: { counselorId },
            attributes: ['id', 'studentId', 'counselorId', 'status', 'createdAt'],
            order: [['createdAt', 'DESC']] as Order,
            limit: 5
        });
        
        console.log('[BookingRepository] All bookings for counselorId', counselorId, ':', allBookingsForCounselor.length);
        if (allBookingsForCounselor.length > 0) {
            console.log('[BookingRepository] Sample booking:', {
                id: allBookingsForCounselor[0].id,
                studentId: allBookingsForCounselor[0].studentId,
                counselorId: allBookingsForCounselor[0].counselorId,
                status: allBookingsForCounselor[0].status
            });
        }

        const bookings = await Booking.findAll({
            where: whereClause,
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
                },
                {
                    model: AvailabilitySlot,
                    as: 'slot',
                    required: false
                },
                {
                    model: Counselor,
                    as: 'counselor',
                    required: false,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']] as Order,
            limit,
            offset
        });

        // If student association not loaded properly, fetch manually
        if (bookings.length > 0 && !(bookings[0] as any).student?.user) {
            const studentIds = [...new Set(bookings.map(b => b.studentId))];
            console.log('[BookingRepository] Manual fetch - studentIds:', studentIds);
            
            // First get all students
            const students = await Student.findAll({
                where: { id: { [Op.in]: studentIds } }
            });
            console.log('[BookingRepository] Manual fetch - students found:', students.length, 'IDs:', students.map(s => s.id));
            
            // Get all user IDs
            const userIds = students.map(s => s.userId).filter(Boolean);
            console.log('[BookingRepository] Manual fetch - userIds:', userIds);
            
            // Fetch all users separately
            const users = userIds.length > 0 ? await User.findAll({
                where: { id: { [Op.in]: userIds } },
                attributes: ['id', 'name', 'email']
            }) : [];
            console.log('[BookingRepository] Manual fetch - users found:', users.length);
            
            const userMap = new Map();
            users.forEach((u: any) => userMap.set(u.id, u));
            
            const studentMap = new Map();
            students.forEach((s: any) => {
                console.log('[BookingRepository] Student entry - s.id:', s.id, 's.userId:', s.userId, 's.dataValues:', s.dataValues);
                const user = userMap.get(s.userId);
                // Explicitly extract id and userId from Sequelize instance
                const studentWithIds = {
                    id: s.id,
                    userId: s.userId,
                    ...s.dataValues,
                    user
                };
                console.log('[BookingRepository] studentWithIds:', studentWithIds);
                studentMap.set(s.id, studentWithIds);
            });
            
            console.log('[BookingRepository] Manual fetch - studentMap keys:', Array.from(studentMap.keys()));
            
            for (const booking of bookings) {
                console.log('[BookingRepository] Assigning student - booking.studentId:', booking.studentId);
                const student = studentMap.get(booking.studentId);
                console.log('[BookingRepository] Assigned student:', student ? { id: student.id, userId: student.userId, name: student.user?.name } : 'NOT FOUND');
                (booking as any).student = student;
            }
        }

        const total = await Booking.count({ where: whereClause });

        const studentMap = new Map<number, any>();
        
        for (const booking of bookings) {
            const student = (booking as any).student;
            if (!student) continue;
            
            const studentId = student.id;
            console.log('[BookingRepository] student object full:', student);
            console.log('[BookingRepository] student.id:', student.id, 'typeof:', typeof student.id);
            console.log('[BookingRepository] student.dataValues:', student.dataValues);
            
            if (!studentMap.has(studentId)) {
                const user = student.user || {};
                console.log('[BookingRepository] Creating student entry, studentId:', student.id, 'userId:', student.userId);
                studentMap.set(studentId, {
                    studentId: student.id,
                    userId: student.userId,
                    id: student.id,
                    name: user.name || 'Unknown',
                    email: user.email || '',
                    profileImageUrl: student.profileImageUrl || null,
                    phoneNumber: student.phoneNumber || null,
                    studyPreferences: student.studyPreferences || null,
                    countryInterest: student.countryInterest || null,
                    academicStatus: student.academicStatus || null,
                    firstBookingDate: booking.createdAt,
                    lastBookingDate: booking.createdAt,
                    totalBookings: 0,
                    completedSessions: 0,
                    upcomingSessions: 0,
                    cancelledSessions: 0,
                    lastBookingStatus: booking.status,
                    lastBookingId: booking.id,
                    lastSlotStartTime: (booking as any).slot?.startTime || null,
                    bookingHistory: []
                });
                
                console.log('[BookingRepository] Created student object:', studentMap.get(studentId));
            }
            
            const studentData = studentMap.get(studentId);
            studentData.totalBookings++;
            
            if (booking.status === 'completed') {
                studentData.completedSessions++;
            } else if (booking.status === 'confirmed' || booking.status === 'started') {
                studentData.upcomingSessions++;
            } else if (booking.status === 'cancelled') {
                studentData.cancelledSessions++;
            }
            
            if (new Date(booking.createdAt) > new Date(studentData.firstBookingDate)) {
                studentData.firstBookingDate = booking.createdAt;
            }
            if (new Date(booking.createdAt) > new Date(studentData.lastBookingDate)) {
                studentData.lastBookingDate = booking.createdAt;
                studentData.lastBookingStatus = booking.status;
                studentData.lastBookingId = booking.id;
                studentData.lastSlotStartTime = (booking as any).slot?.startTime || null;
            }
            
            if (options?.includeBookingHistory) {
                studentData.bookingHistory.push({
                    id: booking.id,
                    status: booking.status,
                    createdAt: booking.createdAt,
                    startedAt: booking.startedAt,
                    completedAt: booking.completedAt,
                    slotId: booking.slotId,
                    slotStartTime: (booking as any).slot?.startTime || null,
                    slotEndTime: (booking as any).slot?.endTime || null,
                    meetingLink: booking.meetingLink,
                    consultationMode: (booking as any).slot?.consultationMode || 'video'
                });
            }
        }

        return {
            students: Array.from(studentMap.values()),
            total
        };
    }

    /**
     * Get detailed information about a specific student for a counselor
     */
    static async getStudentDetailsForCounselor(
        counselorId: number,
        studentId: number
    ): Promise<{
        student: any;
        bookings: any[];
        statistics: {
            totalBookings: number;
            completedSessions: number;
            upcomingSessions: number;
            cancelledSessions: number;
            totalSpent: number;
        };
    } | null> {
        const whereClause = {
            counselorId,
            studentId,
            status: { [Op.ne]: 'cancelled' }
        };

        // First check if there are any bookings
        const allBookings = await Booking.findAll({
            where: { counselorId, studentId },
            attributes: ['id', 'studentId', 'counselorId', 'status', 'createdAt', 'startedAt', 'completedAt', 'slotId', 'meetingLink']
        });

        if (allBookings.length === 0) {
            return null;
        }

        // Fetch student and user separately (workaround for Sequelize include issue)
        const student = await Student.findByPk(studentId);
        if (!student) return null;
        
        const user = await User.findByPk(student.userId);
        const studentData = { ...student.toJSON(), user };
        
        const userData = studentData.user as any || {};
        
        // Fetch slot details for each booking
        const slotIds = allBookings.map(b => b.slotId).filter(Boolean);
        const slots = slotIds.length > 0 ? await AvailabilitySlot.findAll({
            where: { id: { [Op.in]: slotIds } }
        }) : [];
        
        const slotMap = new Map(slots.map((s: any) => [s.id, s]));

        const statistics = {
            totalBookings: allBookings.length,
            completedSessions: allBookings.filter(b => b.status === 'completed').length,
            upcomingSessions: allBookings.filter(b => b.status === 'confirmed' || b.status === 'started').length,
            cancelledSessions: allBookings.filter(b => b.status === 'cancelled').length,
            totalSpent: 0
        };

        const bookings = allBookings.map(booking => {
            const slot = slotMap.get(booking.slotId);
            return {
                id: booking.id,
                status: booking.status,
                createdAt: booking.createdAt,
                startedAt: booking.startedAt,
                completedAt: booking.completedAt,
                slotId: booking.slotId,
                slotStartTime: slot?.startTime || null,
                slotEndTime: slot?.endTime || null,
                meetingLink: booking.meetingLink,
                consultationMode: slot?.consultationMode || 'video'
            };
        });

        return {
            student: {
                studentId: studentData.id,
                userId: studentData.userId,
                name: userData.name || 'Unknown',
                email: userData.email || '',
                profileImageUrl: studentData.profileImageUrl || null,
                phoneNumber: studentData.phoneNumber || null,
                studyPreferences: studentData.studyPreferences || null,
                countryInterest: studentData.countryInterest || null,
                academicStatus: studentData.academicStatus || null,
                firstBookingDate: allBookings[allBookings.length - 1].createdAt,
                lastBookingDate: allBookings[0].createdAt
            },
            bookings,
            statistics
        };
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

    /**
     * Find all bookings for a student
     */
    static async findByStudent(
        studentId: number,
        filters?: {
            status?: string | string[];
            fromDate?: Date;
            toDate?: Date;
        }
    ): Promise<Booking[]> {
        const whereClause: any = { studentId };

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
            include: [
                {
                    model: AvailabilitySlot,
                    as: 'slot',
                    required: false
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
                },
                {
                    model: Counselor,
                    as: 'counselor',
                    required: false,
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
     * Find upcoming bookings for a student
     */
    static async findUpcomingByStudent(
        studentId: number,
        includeAssociations: boolean = true
    ): Promise<Booking[]> {
        const now = new Date();

        return Booking.findAll({
            where: {
                studentId,
                status: { [Op.in]: ['confirmed', 'started'] }
            },
            include: includeAssociations ? [
                {
                    model: AvailabilitySlot,
                    as: 'slot',
                    required: false
                },
                {
                    model: Student,
                    as: 'student',
                    required: false
                },
                {
                    model: Counselor,
                    as: 'counselor',
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
            order: [['createdAt', 'ASC']] as Order
        });
    }
}