import { Request, Response, NextFunction } from 'express';
import { CounselorService } from '../services/CounselorService.js';
import {
    CreateCounselorDto,
    UpdateCounselorDto,
    CreateSlotDto,
    UpdateSlotDto,
    BookingStatusDto,
} from '../types/counselorTypes.js';

export class CounselorController {
    /**
     * SECTION 1: Counselor Profile & Verification (Onboarding)
     */

    /**
     * POST /api/counselors/apply
     * Apply to become a counselor
     */
   static async apply(req: Request, res: Response, next: NextFunction) {
    console.log('🔥🔥🔥 CounselorController.apply REACHED!', req.method, req.url);
    console.log(`[apply] Received request body:`, req.body);
    try {
        const userId = req.user!.id;
        console.log(`[apply] User ID from token: ${userId}`);
        const dto: CreateCounselorDto = req.body;

        console.log(`[apply] Calling service...`);
        const counselor = await CounselorService.applyAsCounselor(userId, dto);
        console.log(`[apply] Service returned, sending response...`);

        return res.status(201).json({
            success: true,
            message: 'Counselor application submitted successfully. Pending verification.',
            data: counselor,
        });
    } catch (error) {
        console.error(`[apply] ERROR:`, error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(400).json({ success: false, error: message });
    }
}

    /**
     * GET /api/counselors/me
     * Get current counselor's profile
     */
    static async getMyProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const counselor = await CounselorService.getMyProfile(userId);

            return res.status(200).json({
                success: true,
                data: counselor,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return res.status(404).json({
                success: false,
                error: message,
            });
        }
    }

    /**
     * GET /api/counselors/me/reviews
     * Get current counselor's reviews
     */
    static async getReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const counselorId = (req as any).counselor?.id;
            const reviews = await CounselorService.getReviews(counselorId);

            return res.status(200).json({
                success: true,
                data: reviews,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return res.status(400).json({
                success: false,
                error: message,
            });
        }
    }

    /**
     * PUT /api/counselors/profile
     * Update counselor profile
     */
    static async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const dto: UpdateCounselorDto = req.body;

            const counselor = await CounselorService.updateProfile(userId, dto);

            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: counselor,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return res.status(400).json({
                success: false,
                error: message,
            });
        }
    }

    /**
     * DELETE /api/counselors/me
     * Soft delete counselor profile
     */
    static async deleteProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            await CounselorService.deleteProfile(userId);

            return res.status(200).json({
                success: true,
                message: 'Counselor profile deactivated successfully',
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return res.status(400).json({
                success: false,
                error: message,
            });
        }
    }

    /**
     * SECTION 2: Availability & Slot Management
     */

    /**
/**
 * POST /api/counselors/slots
 * Create availability slots
 */
static async createSlots(req: Request, res: Response, next: NextFunction) {
    console.log('🔥🔥🔥 CounselorController.createSlots REACHED!');
    try {
        const counselorId = (req as any).counselor?.id;
        const { slots }: { slots: CreateSlotDto[] } = req.body;
        console.log(`[createSlots] counselorId: ${counselorId}, slots:`, slots);

        if (!slots || !Array.isArray(slots) || slots.length === 0) {
            console.log('[createSlots] invalid slots array');
            return res.status(400).json({ success: false, error: 'Slots array is required' });
        }

        console.log('[createSlots] calling service...');
        const createdSlots = await CounselorService.createSlots(counselorId, slots);
        console.log('[createSlots] service returned, sending response');

        return res.status(201).json({
            success: true,
            message: `${createdSlots.length} slots created successfully`,
            data: createdSlots,
        });
    } catch (error) {
        console.error('[createSlots] ERROR:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(400).json({ success: false, error: message });
    }
}

    /**
     * GET /api/counselors/slots
     * Get counselor's slots
     */
    static async getSlots(req: Request, res: Response, next: NextFunction) {
        try {
            const counselorId = (req as any).counselor?.id;
            const { fromDate, toDate, status } = req.query;

            const slots = await CounselorService.getSlots(
                counselorId,
                fromDate as string | undefined,
                toDate as string | undefined,
                status as string | undefined
            );

            return res.status(200).json({
                success: true,
                data: slots,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return res.status(400).json({
                success: false,
                error: message,
            });
        }
    }

    /**
     * PUT /api/counselors/slots/:id
     * Update a specific slot
     */
    static async updateSlot(req: Request, res: Response, next: NextFunction) {
        try {
            const counselorId = (req as any).counselor?.id;
            const slotIdParam = req.params.id;
            const slotId = typeof slotIdParam === 'string' ? parseInt(slotIdParam) : NaN;
            const dto: UpdateSlotDto = req.body;

            if (isNaN(slotId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid slot ID',
                });
            }

            const slot = await CounselorService.updateSlot(counselorId, slotId, dto);

            return res.status(200).json({
                success: true,
                message: 'Slot updated successfully',
                data: slot,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return res.status(400).json({
                success: false,
                error: message,
            });
        }
    }

    /**
     * DELETE /api/counselors/slots/:id
     * Delete a slot
     */
    static async deleteSlot(req: Request, res: Response, next: NextFunction) {
        try {
            const counselorId = (req as any).counselor?.id;
            const slotIdParam = req.params.id;
            const slotId = typeof slotIdParam === 'string' ? parseInt(slotIdParam) : NaN;

            if (isNaN(slotId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid slot ID',
                });
            }

            await CounselorService.deleteSlot(counselorId, slotId);

            return res.status(204).send();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return res.status(400).json({
                success: false,
                error: message,
            });
        }
    }

    /**
     * SECTION 3: Mentorship & Student Tracking
     */

    /**
     * GET /api/counselors/students
     * Get all students who have booked with this counselor
     */
    static async getStudents(req: Request, res: Response, next: NextFunction) {
        try {
            const counselorId = (req as any).counselor?.id;
            const students = await CounselorService.getStudents(counselorId);

            return res.status(200).json({
                success: true,
                data: students,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return res.status(400).json({
                success: false,
                error: message,
            });
        }
    }

    /**
     * GET /api/counselors/students/:id/progress
     * Get specific student's progress
     */
    static async getStudentProgress(req: Request, res: Response, next: NextFunction) {
        try {
            const counselorId = (req as any).counselor?.id;
            const studentIdParam = req.params.id;
            const studentId = typeof studentIdParam === 'string' ? parseInt(studentIdParam) : NaN;

            if (isNaN(studentId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid student ID',
                });
            }

            const progress = await CounselorService.getStudentProgress(counselorId, studentId);

            return res.status(200).json({
                success: true,
                data: progress,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return res.status(403).json({
                success: false,
                error: message,
            });
        }
    }

    /**
     * SECTION 4: Booking & Session Workflow
     */

    /**
     * GET /api/counselors/bookings/upcoming
     * Get upcoming bookings
     */
    static async getUpcomingBookings(req: Request, res: Response, next: NextFunction) {
        try {
            const counselorId = (req as any).counselor?.id;
            const bookings = await CounselorService.getUpcomingBookings(counselorId);

            return res.status(200).json({
                success: true,
                data: bookings,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return res.status(400).json({
                success: false,
                error: message,
            });
        }
    }

    /**
     * PATCH /api/counselors/bookings/:id/status
     * Update booking status
     */
    static async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const counselorId = (req as any).counselor?.id;
            const bookingIdParam = req.params.id;
            const bookingId = typeof bookingIdParam === 'string' ? parseInt(bookingIdParam) : NaN;
            const dto: BookingStatusDto = req.body;

            if (isNaN(bookingId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid booking ID',
                });
            }

            const booking = await CounselorService.updateBookingStatus(
                counselorId,
                bookingId,
                dto
            );

            return res.status(200).json({
                success: true,
                message: `Booking status updated to ${dto.status}`,
                data: booking,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return res.status(400).json({
                success: false,
                error: message,
            });
        }
    }

    /**
     * POST /api/counselors/bookings/:id/join
     * Get meeting link for a session
     */
    static async joinSession(req: Request, res: Response, next: NextFunction) {
        try {
            const counselorId = (req as any).counselor?.id;
            const bookingIdParam = req.params.id;
            const bookingId = typeof bookingIdParam === 'string' ? parseInt(bookingIdParam) : NaN;

            if (isNaN(bookingId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid booking ID',
                });
            }

            const { meetingLink } = await CounselorService.joinSession(
                counselorId,
                bookingId
            );

            return res.status(200).json({
                success: true,
                data: { meetingLink },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            const statusCode = message.includes('only available') ? 403 : 400;
            return res.status(statusCode).json({
                success: false,
                error: message,
            });
        }
    }
}
