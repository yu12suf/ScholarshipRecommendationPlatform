import { Request } from "express";
import { JwtPayload } from "./authTypes";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
