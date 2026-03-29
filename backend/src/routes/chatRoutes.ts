import express from "express";
import { ChatController } from "../controller/ChatController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send", authenticate as any, ChatController.sendMessage);
router.get("/conversations", authenticate as any, ChatController.getConversations);
router.get("/:conversationId", authenticate as any, ChatController.getMessages);
router.patch("/read/:conversationId", authenticate as any, ChatController.markAsRead);
router.post("/upload", authenticate as any, ChatController.uploadFile);

export default router;
