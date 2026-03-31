import { Request, Response, NextFunction } from 'express';
import { Counselor } from '../models/Counselor.js';
import { UserRole } from '../types/userTypes.js';

/**
 * Middleware to check if the user is a verified counselor
 * This middleware should be used AFTER the authenticate middleware
 */
export const checkCounselorRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // First check if user is authenticated and is a counselor
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (req.user.role !== UserRole.COUNSELOR) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Counselor role required.',
      });
    }

    // Fetch the counselor profile
    const counselor = await Counselor.findOne({
      where: { userId: req.user.id }
    });

    if (!counselor) {
      return res.status(404).json({
        success: false,
        error: 'Counselor profile not found. Please complete your counselor application.',
      });
    }

    // Attach counselor info to request
    (req as any).counselor = counselor;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Middleware to check if counselor is verified
 * Use this for endpoints that require verification status
 */
export const requireVerifiedCounselor = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const counselor = (req as any).counselor;

    if (!counselor) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (counselor.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        error: 'Your counselor account is not yet verified. Please wait for admin approval.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Middleware to check if counselor is active
 */
export const requireActiveCounselor = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const counselor = (req as any).counselor;

    if (!counselor) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!counselor.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Your counselor account has been deactivated. Please contact support.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
