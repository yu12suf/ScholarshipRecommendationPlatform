import { Request, Response, NextFunction } from "express";
import configs from "../config/configs.js";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(configs.NODE_ENV === "development" && { stack: error.stack }),
  });
};
