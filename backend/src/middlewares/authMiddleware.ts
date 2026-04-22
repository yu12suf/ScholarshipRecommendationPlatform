import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/authTypes.js";
import { UserRole } from "../types/userTypes.js";
import configs from "../config/configs.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('[authenticate] middleware called');
  try {
    const authHeader = req.headers.authorization;
    console.log('[authenticate] authHeader present:', !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('[authenticate] no valid Bearer token, returning 401');
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log('[authenticate] token missing after split');
      return res.status(401).json({
        success: false,
        error: "Invalid token format",
      });
    }

    console.log('[authenticate] token extracted (first 10 chars):', token.substring(0, 10) + '...');

    const decoded = jwt.verify(token, configs.JWT_SECRET!) as JwtPayload;
    console.log('[authenticate] token verified, user:', decoded);
    req.user = decoded;

    console.log('[authenticate] calling next()');
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('[authenticate] token verification error:', errorMessage);
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('[authorize] middleware called, allowed roles:', allowedRoles);
    if (!req.user) {
      console.log('[authorize] no user, returning 401');
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log('[authorize] insufficient permissions, user role:', req.user.role);
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
    }

    console.log('[authorize] authorized, calling next()');
    next();
  };
};

export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('[optionalAuthenticate] middleware called');
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (!token) {
        console.log('[optionalAuthenticate] token missing after split');
        next();
        return;
      }
      console.log('[optionalAuthenticate] token present, attempting verification');
      const decoded = jwt.verify(token, configs.JWT_SECRET!) as unknown as JwtPayload;
      req.user = decoded;
      console.log('[optionalAuthenticate] token verified, user attached');
    } else {
      console.log('[optionalAuthenticate] no token, continuing without user');
    }

    next();
  } catch (error) {
    console.log('[optionalAuthenticate] token invalid, continuing without user');
    // If token is invalid, just continue without user
    next();
  }
};