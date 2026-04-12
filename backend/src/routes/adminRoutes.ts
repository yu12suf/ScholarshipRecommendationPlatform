import { Router } from "express";
import { AdminController } from "../controller/AdminController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { UserRole } from "../types/userTypes.js";
import { validate, idParamValidation } from "../validators/validationMiddleware.js";

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get("/platform-stats", AdminController.getPlatformStats);
router.get("/platform-stats/engagement", AdminController.getEngagementMetrics);
router.get("/system-logs", AdminController.getSystemLogs);
router.get("/security-center", AdminController.getSecurityCenter);
router.get("/security-center/events", AdminController.getSecurityEvents);
router.get("/security-center/blocked-ips", AdminController.getBlockedIPs);
router.post("/security-center/block-ip", AdminController.blockIP);
router.delete("/security-center/blocked-ips/:ip", AdminController.unblockIP);
router.get("/settings", AdminController.getSettings);
router.put("/settings", AdminController.updateSettings);

export default router;
