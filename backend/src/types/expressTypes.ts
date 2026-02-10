import { Request } from "express";
import { JwtPayload } from "./authTypes.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
