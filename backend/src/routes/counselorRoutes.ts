import { Router, Request, Response, NextFunction } from 'express';
import { CounselorController } from '../controller/CounselorController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { checkCounselorRole, requireActiveCounselor } from '../middlewares/counselorMiddleware.js';
import { validate } from '../validators/validationMiddleware.js';
import {
    createSlotsValidation,
    updateSlotValidation,
    updateBookingStatusValidation,
    applyAsCounselorValidation,
    updateCounselorProfileValidation
} from '../validators/validationMiddleware.js';

const router = Router();

// ✅ Public ping route to test router mounting (no authentication required)
router.get('/ping', (req, res) => {
  console.log('✅ Ping route hit!');
  res.status(200).send('pong');
});

// Apply authentication middleware to all subsequent routes
router.use(authenticate);

/**
 * SECTION 1: Counselor Profile & Verification (Onboarding)
 * These routes are for users who want to become counselors or existing counselors
 */

// POST /api/counselors/apply - Apply to become a counselor
// This route allows any authenticated user to apply (doesn't require counselor role yet)
router.post('/apply',
  // Raw handler to confirm route is hit
  (req: Request, res: Response, next: NextFunction) => {
    console.log('🔥 /apply route raw handler hit!');
    next();
  },
  // ✅ Use validate as a function call – this runs the validations and checks errors
  validate(applyAsCounselorValidation),
  // After validation passes
  (req: Request, res: Response, next: NextFunction) => {
    console.log('⏩ After validate (validation passed)');
    next();
  },
  CounselorController.apply
);

// All routes below require counselor role
router.use(checkCounselorRole);
router.use(requireActiveCounselor);

// GET /api/counselors/me - Get current counselor's profile
router.get('/me', (req: Request, res: Response, next: NextFunction) => CounselorController.getMyProfile(req, res, next));

// GET /api/counselors/me/reviews - Get current counselor's reviews
router.get('/me/reviews', (req: Request, res: Response, next: NextFunction) => CounselorController.getReviews(req, res, next));

// PUT /api/counselors/profile - Update counselor profile
router.put('/profile', 
    updateCounselorProfileValidation, 
    validate(updateCounselorProfileValidation), 
    (req: Request, res: Response, next: NextFunction) => CounselorController.updateProfile(req, res, next)
);

// DELETE /api/counselors/me - Soft delete counselor profile
router.delete('/me', (req: Request, res: Response, next: NextFunction) => CounselorController.deleteProfile(req, res, next));

/**
 * SECTION 2: Availability & Slot Management
 */

// POST /api/counselors/slots - Create availability slots
router.post('/slots', 
    createSlotsValidation, 
    validate(createSlotsValidation), 
    (req: Request, res: Response, next: NextFunction) => CounselorController.createSlots(req, res, next)
);

// GET /api/counselors/slots - Get counselor's slots
router.get('/slots', (req: Request, res: Response, next: NextFunction) => CounselorController.getSlots(req, res, next));

// PUT /api/counselors/slots/:id - Update a specific slot
router.put('/slots/:id', 
    updateSlotValidation, 
    validate(updateSlotValidation), 
    (req: Request, res: Response, next: NextFunction) => CounselorController.updateSlot(req, res, next)
);

// DELETE /api/counselors/slots/:id - Delete a slot
router.delete('/slots/:id', (req: Request, res: Response, next: NextFunction) => CounselorController.deleteSlot(req, res, next));

/**
 * SECTION 3: Mentorship & Student Tracking
 */

// GET /api/counselors/students - Get all students who have booked with this counselor
router.get('/students', (req: Request, res: Response, next: NextFunction) => CounselorController.getStudents(req, res, next));

// GET /api/counselors/students/:id/progress - Get specific student's progress
router.get('/students/:id/progress', (req: Request, res: Response, next: NextFunction) => CounselorController.getStudentProgress(req, res, next));

/**
 * SECTION 4: Booking & Session Workflow
 */

// GET /api/counselors/bookings/upcoming - Get upcoming bookings
router.get('/bookings/upcoming', (req: Request, res: Response, next: NextFunction) => CounselorController.getUpcomingBookings(req, res, next));

// PATCH /api/counselors/bookings/:id/status - Update booking status
router.patch('/bookings/:id/status', 
    updateBookingStatusValidation, 
    validate(updateBookingStatusValidation), 
    (req: Request, res: Response, next: NextFunction) => CounselorController.updateBookingStatus(req, res, next)
);

// POST /api/counselors/bookings/:id/join - Get meeting link for a session
router.post('/bookings/:id/join', (req: Request, res: Response, next: NextFunction) => CounselorController.joinSession(req, res, next));

export default router;