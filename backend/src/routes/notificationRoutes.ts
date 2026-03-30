import express from "express";
import { NotificationController } from "../controller/NotificationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/notifications
router.get("/", authenticate, NotificationController.getNotifications);

// PATCH /api/notifications/:id/read
router.patch("/:id/read", authenticate, NotificationController.markAsRead);

// POST /api/notifications/token
router.post("/token", authenticate, NotificationController.updateToken);

export default router;
