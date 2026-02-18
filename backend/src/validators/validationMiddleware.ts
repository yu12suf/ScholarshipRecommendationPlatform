import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { UserRole } from '../types/userTypes.js';

// Shared validation constants
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
const PASSWORD_MESSAGE = 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';
const VALID_ROLES = Object.values(UserRole) as string[];

export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

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
      if (req.body && value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
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
    .isNumeric().withMessage('Hourly rate must be a number')
    .custom(value => {
      if (value <= 0) {
        throw new Error('Hourly rate must be greater than 0');
      }
      return true;
    }),
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0 }).withMessage('Years of experience must be a non-negative integer')
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
    .isNumeric().withMessage('Hourly rate must be a number')
    .custom(value => {
      if (value <= 0) {
        throw new Error('Hourly rate must be greater than 0');
      }
      return true;
    }),
  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0 }).withMessage('Years of experience must be a non-negative integer')
];

