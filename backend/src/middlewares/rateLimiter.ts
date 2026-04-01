import rateLimit from "express-rate-limit";
import configs from "../config/configs.js";

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: configs.NODE_ENV === "development" ? 1000 : 100, // Limit each IP per windowMs
    message: {
        success: false,
        error: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: configs.NODE_ENV === "development" ? 50 : 20, // More permissive in dev
    message: {
        success: false,
        error:
            "Too many authentication attempts from this IP, please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count all requests, even successful ones
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset requests per hour
    message: {
        success: false,
        error:
            "Too many password reset attempts, please try again after an hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Email verification rate limiter
export const emailVerificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 verification email requests per hour
    message: {
        success: false,
        error:
            "Too many verification email requests, please try again after an hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Create account rate limiter (stricter to prevent spam)
export const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 account creations per hour
    message: {
        success: false,
        error: "Too many accounts created from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
