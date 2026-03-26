import { Request, Response, NextFunction } from "express";
import configs from "../config/configs.js";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error Details:", {
    message: error.message,
    stack: error.stack,
    path: req.path,
  });

  const statusCode = error.statusCode || 500;
  
  if (configs.NODE_ENV === "development") {
    res.status(statusCode).json({
      status: "error",
      message: error.message,
      stack: error.stack
    });
  } else {
    if (error.isOperational) {
      res.status(statusCode).json({
        status: "fail",
        message: error.message
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Something went very wrong!"
      });
    }
  }
};
