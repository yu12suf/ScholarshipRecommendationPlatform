import express from "express";
import { NotificationController } from "../controller/NotificationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/notifications
router.get("/", authenticate, NotificationController.getNotifications);

// PATCH /api/notifications/:id/read
router.patch("/:id/read", authenticate, NotificationController.markAsRead);

// PATCH /api/notifications/:id/click
router.patch("/:id/click", authenticate, NotificationController.markAsClicked);

// PATCH /api/notifications/read-all
router.patch("/read-all", authenticate, NotificationController.markAllAsRead);

// POST /api/notifications/token
router.post("/token", authenticate, NotificationController.updateToken);

// POST /api/notifications/test (Temporary for testing)
router.post("/test", authenticate, async (req, res) => {
  const { NotificationService } = await import("../services/NotificationService.js");
  const notification = await NotificationService.createNotification(
    (req as any).user.id,
    "New Scholarship Match!",
    "We found a 98% match for the 'Global Excellence Scholarship'. Tap to view details.",
    "SCHOLARSHIP_MATCH",
    12
  );
  res.status(200).json({ status: "success", data: notification });
});

export default router;
