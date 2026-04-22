import { Router } from "express";
import { UserController } from "../controller/UserController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { UserRole } from "../types/userTypes.js";
import {
  validate,
  updateProfileValidation,
} from "../validators/validationMiddleware.js";

const router = Router();

// User profile routes (authenticated users)
router.get("/profile", authenticate, UserController.getProfile);
router.put(
  "/profile",
  authenticate,
  validate(updateProfileValidation),
  UserController.updateProfile,
);

router.get(
  "/booked-students",
  authenticate,
  authorize(UserRole.COUNSELOR),
  UserController.getBookedStudents,
);

// Admin only routes
router.get(
  "/stats",
  authenticate,
  authorize(UserRole.ADMIN),
  UserController.getStats,
);
router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  UserController.getAllUsers,
);
router.get(
  "/role/:role",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COUNSELOR),
  UserController.getUsersByRole,
);
router.get(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  UserController.getUserById,
);
router.put(
  "/:id/role",
  authenticate,
  authorize(UserRole.ADMIN),
  UserController.updateUserRole,
);
router.put(
  "/:id/deactivate",
  authenticate,
  authorize(UserRole.ADMIN),
  UserController.deactivateUser,
);
router.put(
  "/:id/activate",
  authenticate,
  authorize(UserRole.ADMIN),
  UserController.activateUser,
);

router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  UserController.deleteUser,
);

export default router;
