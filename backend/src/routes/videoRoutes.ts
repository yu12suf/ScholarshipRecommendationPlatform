import { Router } from "express";
import { VideoController } from "../controller/VideoController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { UserRole } from "../types/userTypes.js";

const router = Router();

// Public route to get all videos (if needed for the student to see, otherwise keep protected)
router.get("/", VideoController.getAll);

// Admin only routes
router.post("/", authenticate, authorize(UserRole.ADMIN), VideoController.create);
router.get("/:id", authenticate, authorize(UserRole.ADMIN), VideoController.getById);
router.put("/:id", authenticate, authorize(UserRole.ADMIN), VideoController.update);
router.delete("/:id", authenticate, authorize(UserRole.ADMIN), VideoController.delete);

export default router;
