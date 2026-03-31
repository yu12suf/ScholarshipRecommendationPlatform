import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { UserRole } from '../types/userTypes.js';

// Shared validation constants
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
const PASSWORD_MESSAGE = 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';
const VALID_ROLES = Object.values(UserRole) as string[];

export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log(`[validate] middleware executing for path: ${req.path}`);
    console.log('[validate] starting validation run...');
    try {
      // Run each validation sequentially to isolate any that might hang
      for (let i = 0; i < validations.length; i++) {
        const validation = validations[i];
        console.log(`[validate] running validation #${i + 1}:`, validation.name || 'anonymous');
        await validation.run(req);
        console.log(`[validate] validation #${i + 1} completed`);
      }
      console.log('[validate] all validations completed');
    } catch (error) {
      console.error('[validate] error in validation run:', error);
      return res.status(500).json({ success: false, error: 'Validation error' });
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      console.log('[validate] validation passed, calling next()');
      return next();
    }

    console.log('[validate] validation failed, sending 400');
    res.status(400).json({
      success: false,
      errors: errors.array()
    });
  };
};

// Validation schemas
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(PASSWORD_REGEX)
    .withMessage(PASSWORD_MESSAGE),

  body('role')
    .optional()
    .isIn(VALID_ROLES).withMessage(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`)
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),

  body('password')
    .notEmpty().withMessage('Password is required')
];

export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty().withMessage('Token is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(PASSWORD_REGEX)
    .withMessage(PASSWORD_MESSAGE),

  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      console.log('[resetPasswordValidation] checking password match');
      if (req.body && value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(PASSWORD_REGEX)
    .withMessage(PASSWORD_MESSAGE)
    .custom((value, { req }) => {
      console.log('[changePasswordValidation] checking new password != current');
      if (req.body && value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      console.log('[changePasswordValidation] checking password match');
      if (req.body && value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
];

export const googleLoginValidation = [
  body().custom((value, { req }) => {
    console.log('[googleLoginValidation] checking for token');
    if (!req.body.credential && !req.body.idToken && !req.body.id_token) {
      throw new Error('Google ID Token is required (credential, idToken, or id_token)');
    }
    return true;
  })
];

// ============================
// Counselor Validation Schemas
// ============================

export const createSlotsValidation = [
  body('slots')
    .isArray({ min: 1 }).withMessage('Slots array is required'),
  body('slots.*.startTime')
    .notEmpty().withMessage('Start time is required for each slot')
    .isISO8601().withMessage('Invalid start time format'),
  body('slots.*.endTime')
    .notEmpty().withMessage('End time is required for each slot')
    .isISO8601().withMessage('Invalid end time format')
    .custom((value, { req }) => {
      console.log('[createSlotsValidation] validating endTime after startTime');
      const slots = req.body.slots;
      const index = slots.findIndex((s: any) => s.endTime === value);
      if (index !== -1 && new Date(value) <= new Date(slots[index].startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    })
];

export const updateSlotValidation = [
  body('startTime')
    .optional()
    .isISO8601().withMessage('Invalid start time format'),
  body('endTime')
    .optional()
    .isISO8601().withMessage('Invalid end time format')
    .custom((value, { req }) => {
      console.log('[updateSlotValidation] validating endTime after startTime');
      if (value && req.body.startTime && new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    })
];

export const updateBookingStatusValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['started', 'completed', 'cancelled']).withMessage('Invalid status value')
];

export const applyAsCounselorValidation = [
  body('bio')
    .optional()
    .isLength({ max: 2000 }).withMessage('Bio must not exceed 2000 characters'),
  body('areasOfExpertise')
    .optional()
    .isLength({ max: 500 }).withMessage('Areas of expertise must not exceed 500 characters'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
    .toFloat(),
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0 }).withMessage('Years of experience must be a non-negative integer')
    .toInt()
];

export const updateCounselorProfileValidation = [
  body('bio')
    .optional()
    .isLength({ max: 2000 }).withMessage('Bio must not exceed 2000 characters'),
  body('areasOfExpertise')
    .optional()
    .isLength({ max: 500 }).withMessage('Areas of expertise must not exceed 500 characters'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
    .toFloat(),
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0 }).withMessage('Years of experience must be a non-negative integer')
    .toInt()
];

export const counselorDirectoryValidation = [
  query("specialization").optional().isString(),
  query("language").optional().isString(),
  query("mode").optional().isIn(["chat", "audio", "video"]),
  query("minRating").optional().isFloat({ min: 0, max: 5 }).toFloat(),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const createBookingValidation = [
  body("slotId").isInt({ min: 1 }).withMessage("slotId is required").toInt(),
  body("notes").optional().isString().isLength({ max: 2000 }),
];

export const rescheduleBookingValidation = [
  body("slotId").isInt({ min: 1 }).withMessage("slotId is required").toInt(),
];

export const adminVerificationValidation = [
  body("verificationStatus")
    .isIn(["verified", "rejected"])
    .withMessage("verificationStatus must be verified or rejected"),
];

export const adminVisibilityValidation = [
  body("isActive").isBoolean().withMessage("isActive must be boolean"),
];

export const shareDocumentValidation = [
  body("studentId").isInt({ min: 1 }).withMessage("studentId is required").toInt(),
  body("documentType")
    .isIn(["sop", "cv", "lor", "transcript", "other"])
    .withMessage("Invalid document type"),
  body("fileUrl").optional().isString().isLength({ max: 500 }),
  body("counselorFeedback").optional().isString(),
];

export const sendMessageValidation = [
  body("recipientUserId").isInt({ min: 1 }).withMessage("recipientUserId is required").toInt(),
  body("body").isString().isLength({ min: 1, max: 5000 }),
];

export const idParamValidation = [
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer").toInt(),
];