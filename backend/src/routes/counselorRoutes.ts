import { Router } from 'express';
import { CounselorController } from '../controller/CounselorController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { checkCounselorRole, requireActiveCounselor } from '../middlewares/counselorMiddleware.js';
import { validate } from '../validators/validationMiddleware.js';
import {
  adminVerificationValidation,
  adminVisibilityValidation,
  applyAsCounselorValidation,
  counselorDirectoryValidation,
  createBookingValidation,
  createSlotsValidation,
  idParamValidation,
  rescheduleBookingValidation,
  sendMessageValidation,
  studentReviewAndConfirmValidation,
  shareDocumentValidation,
  updateBookingStatusValidation,
  updateCounselorProfileValidation,
  updateSlotValidation,
} from '../validators/validationMiddleware.js';
import { UserRole } from '../types/userTypes.js';

const router = Router();

router.get('/ping', (_req, res) => res.status(200).send('pong'));
router.get('/directory', validate(counselorDirectoryValidation), CounselorController.publicDirectory);
router.get('/banks', CounselorController.getBanks);

router.use(authenticate);

router.post('/apply', validate(applyAsCounselorValidation), CounselorController.apply);
router.get('/recommendations/me', authorize(UserRole.STUDENT), CounselorController.recommendForMe);
router.get('/:id/available-sessions', CounselorController.getAvailableSessions); // New endpoint for students
router.get('/:id/reviews', CounselorController.getReviews);
router.get('/by-user/:userId', CounselorController.getByUserId);
router.get('/student/bookings', authorize(UserRole.STUDENT, UserRole.COUNSELOR), CounselorController.getStudentBookings);

router.post('/bookings', authorize(UserRole.STUDENT), validate(createBookingValidation), CounselorController.createBooking);
router.patch('/bookings/:id/reschedule', authorize(UserRole.STUDENT), validate(idParamValidation), validate(rescheduleBookingValidation), CounselorController.rescheduleBooking);
router.post('/bookings/:id/review-confirm', authorize(UserRole.STUDENT), validate(idParamValidation), validate(studentReviewAndConfirmValidation), CounselorController.reviewAndConfirmBooking);
router.get('/:id/slots', CounselorController.getSlots);
router.patch('/bookings/:id/cancel', validate(idParamValidation), CounselorController.cancelBooking);
router.post('/bookings/:id/join', validate(idParamValidation), CounselorController.joinSession);

router.post('/messages', validate(sendMessageValidation), CounselorController.sendMessage);
router.get('/messages/threads/:userId', CounselorController.getThread);

router.get('/admin/list', authorize(UserRole.ADMIN), CounselorController.adminList);
router.patch('/admin/:id/verification', authorize(UserRole.ADMIN), validate(idParamValidation), validate(adminVerificationValidation), CounselorController.adminUpdateVerification);
router.patch('/admin/:id/visibility', authorize(UserRole.ADMIN), validate(idParamValidation), validate(adminVisibilityValidation), CounselorController.adminUpdateVisibility);
router.patch('/admin/payouts/:id/status', authorize(UserRole.ADMIN), validate(idParamValidation), CounselorController.adminUpdatePayoutStatus);
router.get('/admin/payouts', authorize(UserRole.ADMIN), CounselorController.listPayouts);
router.get('/admin/chapa-transactions', authorize(UserRole.ADMIN), CounselorController.getChapaMerchantTransactions);
router.post('/admin/:id/payout', authorize(UserRole.ADMIN), validate(idParamValidation), CounselorController.adminPayout);

router.get('/me', authorize(UserRole.COUNSELOR), CounselorController.getMyProfile);
router.get('/dashboard/overview', authorize(UserRole.COUNSELOR), CounselorController.getDashboardOverview);

router.use(checkCounselorRole);
router.use(requireActiveCounselor);

router.get('/me/payouts', authorize(UserRole.COUNSELOR), CounselorController.listPayouts);
router.post('/me/payouts/request', authorize(UserRole.COUNSELOR), CounselorController.requestPayout);
router.get('/me/wallet/ledger', authorize(UserRole.COUNSELOR), CounselorController.getMyWalletLedger);

router.get('/me/reviews', CounselorController.getReviews);
router.put('/profile', validate(updateCounselorProfileValidation), CounselorController.updateProfile);
router.delete('/me', CounselorController.deleteProfile);

router.post('/slots', validate(createSlotsValidation), CounselorController.createSlots);
router.get('/slots', CounselorController.getSlots);
router.post('/initiate-booking', CounselorController.initiateBooking);
router.put('/slots/:id', validate(idParamValidation), validate(updateSlotValidation), CounselorController.updateSlot);
router.delete('/slots/:id', validate(idParamValidation), CounselorController.deleteSlot);

router.get('/students', CounselorController.getStudents);
router.get('/students/:id/progress', validate(idParamValidation), CounselorController.getStudentProgress);

router.get('/dashboard/documents', CounselorController.getDashboardDocuments);
router.post('/dashboard/documents/share', validate(shareDocumentValidation), CounselorController.shareDocument);

router.get('/bookings/upcoming', CounselorController.getUpcomingBookings);
router.patch('/bookings/:id/status', validate(idParamValidation), validate(updateBookingStatusValidation), CounselorController.updateBookingStatus);

export default router;