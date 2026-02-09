import { Router } from "express";
import { AuthController } from "../controller/AuthController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  validate,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} from "../validators/validationMiddleware.js";
import {
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  createAccountLimiter,
} from "../middlewares/rateLimiter.js";

const router = Router();

// Public routes with rate limiting
router.post(
  "/register",
  createAccountLimiter,
  validate(registerValidation),
  AuthController.register,
);
router.post(
  "/login",
  authLimiter,
  validate(loginValidation),
  AuthController.login,
);
router.post("/refresh-token", authLimiter, AuthController.refreshToken);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validate(forgotPasswordValidation),
  AuthController.forgotPassword,
);
router.post(
  "/reset-password",
  passwordResetLimiter,
  validate(resetPasswordValidation),
  AuthController.resetPassword,
);
router.post(
  "/verify-email",
  emailVerificationLimiter,
  AuthController.verifyEmail,
);
router.post(
  "/resend-verification",
  emailVerificationLimiter,
  AuthController.resendVerificationEmail,
);

// Protected routes
router.post("/logout", authenticate, AuthController.logout);
router.post("/logout-all", authenticate, AuthController.logoutAll);
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordValidation),
  AuthController.changePassword,
);
router.get("/me", authenticate, AuthController.me);

export default router;
