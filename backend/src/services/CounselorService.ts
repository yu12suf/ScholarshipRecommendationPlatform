import { Op, Order } from 'sequelize';
import { Counselor } from '../models/Counselor.js';
import { User } from '../models/User.js';
import { UserRole } from '../types/userTypes.js';
import { AvailabilitySlot } from '../models/AvailabilitySlot.js';
import { Booking } from '../models/Booking.js';
import { Student } from '../models/Student.js';
import { Payment } from '../models/Payment.js';
import { Document } from '../models/Document.js';
import { CounselorReview } from '../models/CounselorReview.js';
import configs from '../config/configs.js';
import {
    CreateCounselorDto,
    UpdateCounselorDto,
    CreateSlotDto,
    UpdateSlotDto,
    BookingStatusDto,
    DocumentFeedbackDto,
    CounselorResponse,
    SlotResponse,
    BookingResponse,
    StudentProgressResponse,
} from '../types/counselorTypes.js';

export class CounselorService {
    /**
     * SECTION 1: Counselor Profile & Verification (Onboarding)
     */

    /**
     * Apply to become a counselor
     * POST /api/counselors/apply
     */
    static async applyAsCounselor(userId: number, dto: CreateCounselorDto): Promise<CounselorResponse> {
        // Check if user already has a counselor profile
        const existingCounselor = await Counselor.findOne({ where: { userId } });
        if (existingCounselor) {
            throw new Error('User already has a counselor profile');
        }

        // Create counselor profile
        const counselor = await Counselor.create({
            userId,
            bio: dto.bio || '',
            areasOfExpertise: dto.areasOfExpertise || '',
            hourlyRate: dto.hourlyRate,
            yearsOfExperience: dto.yearsOfExperience,
            verificationStatus: 'pending',
            isActive: true,
            isOnboarded: true,
        });

        // Get user details
        const user = await User.findByPk(userId);

        return this.formatCounselorResponse(counselor, user!);
    }

    /**
     * Get current counselor's profile
     * GET /api/counselors/me
     */
    static async getMyProfile(userId: number): Promise<CounselorResponse> {
        const counselor = await Counselor.findOne({ 
            where: { userId },
            include: [{ model: User, as: 'user' }]
        });

        if (!counselor) {
            throw new Error('Counselor profile not found');
        }

        // Calculate average rating
        const reviews = await CounselorReview.findAll({
            where: { counselorId: counselor.id }
        });

        const totalRatings = reviews.length;
        const averageRating = totalRatings > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings
            : 0;

        const response = this.formatCounselorResponse(counselor, counselor.user);
        response.rating = Number(averageRating.toFixed(2));

        return response;
    }

    /**
     * Update counselor profile
     * PUT /api/counselors/profile
     */
    static async updateProfile(userId: number, dto: UpdateCounselorDto): Promise<CounselorResponse> {
        const counselor = await Counselor.findOne({ where: { userId } });

        if (!counselor) {
            throw new Error('Counselor profile not found');
        }

        // Fields that can be updated (not verification status or isActive)
        const allowedUpdates: Partial<Counselor> = {};
        if (dto.bio !== undefined) allowedUpdates.bio = dto.bio;
        if (dto.areasOfExpertise !== undefined) allowedUpdates.areasOfExpertise = dto.areasOfExpertise;
        if (dto.hourlyRate !== undefined) allowedUpdates.hourlyRate = dto.hourlyRate;
        if (dto.yearsOfExperience !== undefined) allowedUpdates.yearsOfExperience = dto.yearsOfExperience;

        await counselor.update(allowedUpdates);

        const user = await User.findByPk(userId);
        return this.formatCounselorResponse(counselor, user!);
    }

    /**
     * Soft delete counselor profile
     * DELETE /api/counselors/me
     */
    static async deleteProfile(userId: number): Promise<void> {
        const counselor = await Counselor.findOne({ where: { userId } });

        if (!counselor) {
            throw new Error('Counselor profile not found');
        }

        // Soft delete - set isActive to false
        await counselor.update({ isActive: false });
    }

    /**
     * SECTION 2: Availability & Slot Management
     */

    /**
     * Create multiple availability slots
     * POST /api/counselors/slots
     */
    static async createSlots(counselorId: number, slots: CreateSlotDto[]): Promise<SlotResponse[]> {
        const createdSlots: AvailabilitySlot[] = [];

        for (const slot of slots) {
            // Check for overlapping slots
            const overlap = await AvailabilitySlot.findOne({
                where: {
                    counselorId,
                    status: { [Op.ne]: 'cancelled' },
                    [Op.or]: [
                        {
                            [Op.and]: [
                                { startTime: { [Op.lte]: slot.startTime } },
                                { endTime: { [Op.gt]: slot.startTime } }
                            ]
                        },
                        {
                            [Op.and]: [
                                { startTime: { [Op.lt]: slot.endTime } },
                                { endTime: { [Op.gte]: slot.endTime } }
                            ]
                        },
                        {
                            [Op.and]: [
                                { startTime: { [Op.gte]: slot.startTime } },
                                { endTime: { [Op.lte]: slot.endTime } }
                            ]
                        }
                    ]
                }
            });

            if (overlap) {
                throw new Error(`Slot overlaps with existing slot ID: ${overlap.id}`);
            }

            const newSlot = await AvailabilitySlot.create({
                counselorId,
                startTime: slot.startTime,
                endTime: slot.endTime,
                status: 'available',
            });

            createdSlots.push(newSlot);
        }

        return createdSlots.map(slot => this.formatSlotResponse(slot));
    }

    /**
     * Get counselor's slots
     * GET /api/counselors/slots
     */
    static async getSlots(
        counselorId: number,
        fromDate?: string,
        toDate?: string
    ): Promise<SlotResponse[]> {
        const whereClause: any = { counselorId };

        if (fromDate && toDate) {
            whereClause.startTime = { [Op.gte]: new Date(fromDate) };
            whereClause.endTime = { [Op.lte]: new Date(toDate) };
        }

        const slots = await AvailabilitySlot.findAll({
            where: whereClause,
            order: [['startTime', 'ASC']] as Order
        });

        return slots.map(slot => this.formatSlotResponse(slot));
    }

    /**
     * Update a specific slot
     * PUT /api/counselors/slots/:id
     */
    static async updateSlot(
        counselorId: number,
        slotId: number,
        dto: UpdateSlotDto
    ): Promise<SlotResponse> {
        const slot = await AvailabilitySlot.findByPk(slotId);

        if (!slot) {
            throw new Error('Slot not found');
        }

        // Security check - ensure counselor owns this slot
        if (slot.counselorId !== counselorId) {
            throw new Error('Unauthorized to modify this slot');
        }

        // Cannot modify booked slots
        if (slot.status === 'booked') {
            throw new Error('Cannot modify a booked slot');
        }

        // Check for overlapping slots if times are being changed
        if (dto.startTime || dto.endTime) {
            const newStartTime = dto.startTime || slot.startTime;
            const newEndTime = dto.endTime || slot.endTime;

            const overlap = await AvailabilitySlot.findOne({
                where: {
                    counselorId,
                    id: { [Op.ne]: slotId },
                    status: { [Op.ne]: 'cancelled' },
                    [Op.or]: [
                        {
                            [Op.and]: [
                                { startTime: { [Op.lte]: newStartTime } },
                                { endTime: { [Op.gt]: newStartTime } }
                            ]
                        },
                        {
                            [Op.and]: [
                                { startTime: { [Op.lt]: newEndTime } },
                                { endTime: { [Op.gte]: newEndTime } }
                            ]
                        },
                        {
                            [Op.and]: [
                                { startTime: { [Op.gte]: newStartTime } },
                                { endTime: { [Op.lte]: newEndTime } }
                            ]
                        }
                    ]
                }
            });

            if (overlap) {
                throw new Error('Updated slot would overlap with existing slot');
            }
        }

        await slot.update({
            startTime: dto.startTime || slot.startTime,
            endTime: dto.endTime || slot.endTime,
        });

        return this.formatSlotResponse(slot);
    }

    /**
     * Delete a slot
     * DELETE /api/counselors/slots/:id
     */
    static async deleteSlot(counselorId: number, slotId: number): Promise<void> {
        const slot = await AvailabilitySlot.findByPk(slotId);

        if (!slot) {
            throw new Error('Slot not found');
        }

        // Security check
        if (slot.counselorId !== counselorId) {
            throw new Error('Unauthorized to delete this slot');
        }

        // Cannot delete booked slots
        if (slot.status === 'booked') {
            throw new Error('Cannot delete a booked slot');
        }

        // Soft delete - mark as cancelled
        await slot.update({ status: 'cancelled' });
    }

    /**
     * SECTION 3: Mentorship & Student Tracking
     */

    /**
     * Get all students who have booked with this counselor
     * GET /api/counselors/students
     */
    static async getStudents(counselorId: number): Promise<any[]> {
        const bookings = await Booking.findAll({
            where: { counselorId },
            include: [
                {
                    model: Student,
                    as: 'student',
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

        // Get unique students with their last booking info
        const studentMap = new Map<number, any>();
        
        for (const booking of bookings) {
            if (!studentMap.has(booking.studentId)) {
                studentMap.set(booking.studentId, {
                    studentId: booking.student.id,
                    userId: booking.student.userId,
                    name: (booking.student as any).user?.name || 'Unknown',
                    email: (booking.student as any).user?.email || 'Unknown',
                    lastBookingDate: booking.createdAt,
                    lastBookingStatus: booking.status,
                });
            }
        }

        return Array.from(studentMap.values());
    }

    /**
     * Get specific student's progress
     * GET /api/counselors/students/:id/progress
     */
    static async getStudentProgress(
        counselorId: number,
        studentId: number
    ): Promise<StudentProgressResponse> {
        // Security check - verify counselor has had a booking with this student
        const booking = await Booking.findOne({
            where: {
                counselorId,
                studentId
            }
        });

        if (!booking) {
            throw new Error('You are not authorized to view this student\'s progress');
        }

        const student = await Student.findByPk(studentId, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'email']
                }
            ]
        });

        if (!student) {
            throw new Error('Student not found');
        }

        return {
            studentId: student.id,
            name: (student as any).user?.name || 'Unknown',
            email: (student as any).user?.email || 'Unknown',
            learningPath: null,
            recentAssessments: [],
            trackedScholarships: [],
        };
    }

    /**
     * Give feedback on student's document
     * POST /api/counselors/students/:id/feedback
     */
    static async giveDocumentFeedback(
        counselorId: number,
        studentId: number,
        dto: DocumentFeedbackDto
    ): Promise<any> {
        // Security check
        const booking = await Booking.findOne({
            where: {
                counselorId,
                studentId
            }
        });

        if (!booking) {
            throw new Error('You are not authorized to give feedback to this student');
        }

        // Verify document belongs to this student
        const document = await Document.findOne({
            where: {
                id: dto.documentId,
                studentId
            }
        });

        if (!document) {
            throw new Error('Document not found');
        }

        // Update document with counselor feedback
        const updates: any = {
            counselorFeedback: dto.comments,
            counselorId,
            status: 'reviewed'
        };

        if (dto.reviewedFile) {
            if (dto.reviewedFile.s3Key) {
                updates.reviewedFileUrl = dto.reviewedFile.fileUrl || null;
            }
        }

        await document.update(updates);

        return document;
    }

    /**
     * SECTION 4: Booking & Session Workflow
     */

    /**
     * Get upcoming bookings
     * GET /api/counselors/bookings/upcoming
     */
    static async getUpcomingBookings(counselorId: number): Promise<BookingResponse[]> {
        const now = new Date();

        const bookings = await Booking.findAll({
            where: {
                counselorId,
                status: { [Op.in]: ['confirmed', 'started'] },
                // Get bookings where slot start time is in the future
            },
            include: [
                {
                    model: Student,
                    as: 'student',
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
                    as: 'slot'
                }
            ],
            order: [['createdAt', 'ASC']] as Order
        });

        // Filter to only include future bookings and add countdown
        const upcomingBookings = bookings.filter(booking => {
            const slot = (booking as any).slot;
            return slot && new Date(slot.startTime) > now;
        });

        return upcomingBookings.map(booking => {
            const response = this.formatBookingResponse(booking);
            const slot = (booking as any).slot;
            if (slot) {
                const timeUntilStart = new Date(slot.startTime).getTime() - now.getTime();
                (response as any).timeUntilStart = Math.floor(timeUntilStart / (1000 * 60)); // in minutes
            }
            return response;
        });
    }

    /**
     * Update booking status
     * PATCH /api/counselors/bookings/:id/status
     */
    static async updateBookingStatus(
        counselorId: number,
        bookingId: number,
        dto: BookingStatusDto
    ): Promise<BookingResponse> {
        const booking = await Booking.findByPk(bookingId, {
            include: [{ model: AvailabilitySlot, as: 'slot' }]
        });

        if (!booking) {
            throw new Error('Booking not found');
        }

        // Security check
        if (booking.counselorId !== counselorId) {
            throw new Error('Unauthorized to modify this booking');
        }

        // Validate status transitions
        if (dto.status === 'started') {
            if (booking.status !== 'confirmed') {
                throw new Error('Can only start a confirmed booking');
            }
            await booking.update({
                status: 'started',
                startedAt: new Date()
            });
        } else if (dto.status === 'completed') {
            if (booking.status !== 'started') {
                throw new Error('Can only complete a started booking');
            }

            // Critical: Release escrow funds
            if (booking.paymentId) {
                const payment = await Payment.findByPk(booking.paymentId);
                if (payment && payment.escrowStatus === 'held') {
                    // Calculate commission and counselor payout
                    const commissionRate = 0.15; // 15% commission
                    const commission = Number(payment.amount) * commissionRate;
                    const counselorPayout = Number(payment.amount) - commission;

                    await payment.update({
                        escrowStatus: 'released',
                        adminCommission: commission,
                        counselorPayout: counselorPayout,
                    });

                    // Update counselor's total sessions
                    const counselor = await Counselor.findByPk(counselorId);
                    if (counselor) {
                        await counselor.update({
                            totalSessions: counselor.totalSessions + 1
                        });
                    }
                }
            }

            await booking.update({
                status: 'completed',
                completedAt: new Date()
            });

            // Update slot status back to available
            if (booking.slotId) {
                await AvailabilitySlot.update(
                    { status: 'available', reservedStudentId: null },
                    { where: { id: booking.slotId } }
                );
            }
        } else if (dto.status === 'cancelled') {
            if (booking.status === 'completed') {
                throw new Error('Cannot cancel a completed booking');
            }
            await booking.update({ status: 'cancelled' });

            // Free up the slot
            if (booking.slotId) {
                await AvailabilitySlot.update(
                    { status: 'available', reservedStudentId: null },
                    { where: { id: booking.slotId } }
                );
            }
        }

        return this.formatBookingResponse(booking);
    }

    /**
     * Get meeting link for a session
     * POST /api/counselors/bookings/:id/join
     */
    static async joinSession(counselorId: number, bookingId: number): Promise<{ meetingLink: string }> {
        const booking = await Booking.findByPk(bookingId, {
            include: [{ model: AvailabilitySlot, as: 'slot' }]
        });

        if (!booking) {
            throw new Error('Booking not found');
        }

        // Security check
        if (booking.counselorId !== counselorId) {
            throw new Error('Unauthorized to join this session');
        }

        // Time validation - meeting link available 10 minutes before
        const now = new Date();
        const slot = (booking as any).slot;
        
        if (slot) {
            const meetingStart = new Date(slot.startTime);
            const timeDiffMinutes = (meetingStart.getTime() - now.getTime()) / (1000 * 60);

            if (timeDiffMinutes > 10) {
                throw new Error('Meeting link is only available 10 minutes before the start time');
            }
        }

        // Generate or return meeting link
        // In production, this would integrate with a video service like Zoom, Jitsi, etc.
        const meetingLink = booking.meetingLink || `https://meet.edu-pathway.com/session-${booking.id}`;

        return { meetingLink };
    }

    // Helper methods

    private static formatCounselorResponse(counselor: Counselor, user: User): CounselorResponse {
        return {
            id: counselor.id,
            userId: counselor.userId,
            name: user.name,
            email: user.email,
            bio: counselor.bio,
            areasOfExpertise: counselor.areasOfExpertise,
            hourlyRate: counselor.hourlyRate,
            yearsOfExperience: counselor.yearsOfExperience,
            verificationStatus: counselor.verificationStatus as any,
            isActive: counselor.isActive,
            rating: counselor.rating || 0,
            totalSessions: counselor.totalSessions || 0,
            createdAt: counselor.createdAt,
            updatedAt: counselor.updatedAt,
        };
    }

    private static formatSlotResponse(slot: AvailabilitySlot): SlotResponse {
        return {
            id: slot.id,
            counselorId: slot.counselorId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: slot.status as any,
            reservedStudentId: slot.reservedStudentId,
            meetingLink: slot.meetingLink,
        };
    }

    private static formatBookingResponse(booking: Booking): BookingResponse {
        return {
            id: booking.id,
            studentId: booking.studentId,
            counselorId: booking.counselorId,
            slotId: booking.slotId,
            status: booking.status,
            meetingLink: booking.meetingLink,
            startedAt: booking.startedAt,
            completedAt: booking.completedAt,
            createdAt: booking.createdAt,
        };
    }
}
