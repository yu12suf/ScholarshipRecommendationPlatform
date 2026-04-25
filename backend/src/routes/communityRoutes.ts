import express from "express";
import { CommunityController } from "../controller/CommunityController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { UserRole } from "../types/userTypes.js";

const router = express.Router();

router.use(authenticate as any);

// Groups
router.get("/groups", CommunityController.getAllGroups);
router.get("/my-groups", CommunityController.getMyGroups);
router.get("/groups/search", CommunityController.searchGroups);
router.get("/groups/:id", CommunityController.getGroupDetails);
router.post("/groups", authorize(UserRole.ADMIN), CommunityController.createGroup);
router.put("/groups/:id", CommunityController.updateGroup);
router.delete("/groups/:id", authorize(UserRole.ADMIN), CommunityController.deleteGroup);
router.patch("/groups/:id/activate", authorize(UserRole.ADMIN), CommunityController.toggleGroupActive);
router.post("/groups/:id/join", CommunityController.joinGroup);
router.post("/groups/join/:inviteLink", CommunityController.joinByInviteLink);
router.post("/groups/:id/leave", CommunityController.leaveGroup);
router.get("/groups/:groupId/invite", CommunityController.getInviteLink);
router.post("/groups/:groupId/invite", CommunityController.generateInviteLink);

// Members
router.get("/groups/:groupId/users", CommunityController.getGroupUsers);
router.post("/groups/:groupId/members", CommunityController.addMember);
router.delete("/groups/:groupId/members/:userId", CommunityController.removeMember);
router.put("/groups/:groupId/members/:userId", CommunityController.updateMemberRole);

// Messages
router.get("/groups/:groupId/messages", CommunityController.getGroupMessages);
router.post("/groups/:groupId/messages", CommunityController.sendMessage);
router.put("/groups/:groupId/messages/:messageId", CommunityController.editMessage);
router.delete("/groups/:groupId/messages/:messageId", CommunityController.deleteMessage);
router.post("/groups/:groupId/messages/:messageId/pin", CommunityController.pinMessage);
router.post("/groups/:groupId/messages/:messageId/react", CommunityController.reactToMessage);

// File upload
router.post("/upload", CommunityController.uploadFile);

 // Admin
 router.get("/admin/groups", authorize(UserRole.ADMIN), CommunityController.adminGetAllGroups);
 router.get("/admin/members", authorize(UserRole.ADMIN), CommunityController.adminGetAllMembers);
 router.delete("/admin/groups/:groupId/ban/:userId", authorize(UserRole.ADMIN), CommunityController.adminBanUserFromGroup);
 router.delete("/admin/groups/:groupId/unban/:userId", authorize(UserRole.ADMIN), CommunityController.adminUnbanUserFromGroup);
 router.get("/admin/stats", authorize(UserRole.ADMIN), CommunityController.adminGetStats);

export default router;