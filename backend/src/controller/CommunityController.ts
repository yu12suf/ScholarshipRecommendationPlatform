import { Request, Response } from "express";
import { CommunityService } from "../services/CommunityService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../errors/AppError.js";
import { FileService } from "../services/FileService.js";
import { CommunityGroup } from "../models/CommunityGroup.js";
import { CommunityMember, MemberStatus } from "../models/CommunityMember.js";
import { CommunityMessage } from "../models/CommunityMessage.js";
import { User } from "../models/User.js";
import { UserRole } from "../types/userTypes.js";

export class CommunityController {
    static uploadFile = catchAsync(async (req: Request, res: Response) => {
        if (!req.files || !req.files.file) throw new AppError("No file uploaded", 400);
        const file = req.files.file as any;
        const secureUrl = await FileService.uploadFile(file.data, "community_posts");
        res.status(200).json({ status: "success", data: { url: secureUrl } });
    });

    static getAllGroups = catchAsync(async (req: Request, res: Response) => {
        const groups = await CommunityService.getAllGroups(req.user?.id, req.user?.role as any);
        res.status(200).json({ status: "success", data: { groups } });
    });

    static getMyGroups = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        const groups = await CommunityService.getMyGroups(userId);
        res.status(200).json({ status: "success", data: { groups } });
    });

    static createGroup = catchAsync(async (req: Request, res: Response) => {
        const userId = (req as any).user.id;
        if (req.user?.role !== UserRole.ADMIN) throw new AppError("Only system admin can create groups", 403);
        const group = await CommunityService.createGroup(userId, req.body);
        res.status(201).json({ status: "success", data: { group } });
    });

    static getGroupDetails = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = (req as any).user?.id;
        const details = await CommunityService.getGroupDetails(Number(id), userId);
        res.status(200).json({ status: "success", data: { group: details } });
    });

     static updateGroup = catchAsync(async (req: Request, res: Response) => {
         const { id } = req.params;
         const userId = (req as any).user.id;
         const userRole = req.user?.role as string;
         const group = await CommunityService.updateGroup(Number(id), userId, userRole, req.body);
         res.status(200).json({ status: "success", data: { group } });
     });

    static deleteGroup = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (req.user?.role !== UserRole.ADMIN) throw new AppError("Only system admin can delete groups", 403);
        await CommunityService.deleteGroup(Number(id));
        res.status(200).json({ status: "success", message: "Group deleted" });
    });

    static toggleGroupActive = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (req.user?.role !== UserRole.ADMIN) throw new AppError("Only system admin can change group status", 403);
        const { isActive } = req.body;
        const group = await CommunityService.toggleGroupActive(Number(id), isActive);
        res.status(200).json({ status: "success", data: { group } });
    });

    static joinGroup = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const result = await CommunityService.joinGroup(Number(id), userId);
        res.status(200).json({ status: "success", message: result.message });
    });

    static joinByInviteLink = catchAsync(async (req: Request, res: Response) => {
        const { inviteLink } = req.params;
        const userId = (req as any).user.id;
        const result = await CommunityService.joinGroup(Number(inviteLink), userId);
        res.status(200).json({ status: "success", message: result.message });
    });

    static leaveGroup = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const result = await CommunityService.leaveGroup(Number(id), userId);
        res.status(200).json({ status: "success", message: result.message });
    });

    static searchGroups = catchAsync(async (req: Request, res: Response) => {
        const { q } = req.query;
        if (!q) throw new AppError("Search query is required", 400);
        const groups = await CommunityService.searchGroups(q as string);
        res.status(200).json({ status: "success", data: { groups } });
    });

    static getGroupUsers = catchAsync(async (req: Request, res: Response) => {
        const { groupId } = req.params;
        const { q } = req.query;
        const users = await CommunityService.getGroupNonMembers(Number(groupId), q as string);
        res.status(200).json({ status: "success", data: { users } });
    });

    static addMember = catchAsync(async (req: Request, res: Response) => {
        const { groupId } = req.params;
        const { userId, role } = req.body;
        const adderId = (req as any).user.id;
        const member = await CommunityService.addMember(Number(groupId), adderId, userId, role);
        res.status(200).json({ status: "success", data: { member } });
    });

    static removeMember = catchAsync(async (req: Request, res: Response) => {
        const { groupId, userId: targetUserId } = req.params;
        const removerId = (req as any).user.id;
        const result = await CommunityService.removeMember(Number(groupId), removerId, Number(targetUserId));
        res.status(200).json({ status: "success", message: result.message });
    });

    static updateMemberRole = catchAsync(async (req: Request, res: Response) => {
        const { groupId, userId } = req.params;
        const { role } = req.body;
        const actorId = (req as any).user.id;
        const result = await CommunityService.updateMemberRole(Number(groupId), actorId, Number(userId), role);
        res.status(200).json({ status: "success", message: result.message });
    });

    static getGroupMessages = catchAsync(async (req: Request, res: Response) => {
        const { groupId } = req.params;
        const { limit = 50, before } = req.query;
        const messages = await CommunityService.getGroupMessages(Number(groupId), Number(limit), before as string);
        res.status(200).json({ status: "success", data: { messages } });
    });

    static sendMessage = catchAsync(async (req: Request, res: Response) => {
        const { groupId } = req.params;
        const userId = (req as any).user.id;
        const body = req.body;

        let attachmentUrl: string | null = null;
        let attachmentName: string | null = null;
        let messageType = body.messageType || 'text';
        const content = body.content || '';
        const replyToId = body.replyToId || null;

        if (req.files && req.files.file) {
            const file = req.files.file as any;
            attachmentUrl = await FileService.uploadFile(file.data, "community_posts");
            attachmentName = file.name;
            messageType = file.mimetype.startsWith('image/') ? 'image' : 'file';
        }

        const data = { content, messageType, attachmentUrl, attachmentName, replyToId };
        const message = await CommunityService.sendMessage(Number(groupId), userId, data);
        res.status(201).json({ status: "success", data: { message } });
    });

    static editMessage = catchAsync(async (req: Request, res: Response) => {
        const { groupId, messageId } = req.params;
        const userId = (req as any).user.id;
        const { content } = req.body;
        const message = await CommunityService.editMessage(Number(groupId), Number(messageId), userId, content);
        res.status(200).json({ status: "success", data: { message } });
    });

    static deleteMessage = catchAsync(async (req: Request, res: Response) => {
        const { groupId, messageId } = req.params;
        const userId = (req as any).user.id;
        const userRole = req.user?.role || '';
        await CommunityService.deleteMessage(Number(groupId), Number(messageId), userId, userRole);
        res.status(200).json({ status: "success", message: "Message deleted" });
    });

    static pinMessage = catchAsync(async (req: Request, res: Response) => {
        const { groupId, messageId } = req.params;
        const userId = (req as any).user.id;
        const result = await CommunityService.pinMessage(Number(groupId), Number(messageId), userId);
        res.status(200).json({ status: "success", data: { isPinned: result.isPinned } });
    });

    static reactToMessage = catchAsync(async (req: Request, res: Response) => {
        const { groupId, messageId } = req.params;
        const { emoji } = req.body;
        const userId = (req as any).user.id;
        const result = await CommunityService.reactToMessage(Number(groupId), Number(messageId), userId, emoji);
        res.status(200).json({ status: "success", data: { reactions: result.reactions, reactionsCount: result.reactions.length } });
    });

    static getInviteLink = catchAsync(async (req: Request, res: Response) => {
        const { groupId } = req.params;
        const group = await CommunityGroup.findByPk(Number(groupId));
        if (!group) throw new AppError("Group not found", 404);
        res.status(200).json({ status: "success", data: { inviteLink: group.inviteLink } });
    });

    static generateInviteLink = catchAsync(async (req: Request, res: Response) => {
        const { groupId } = req.params;
        const inviteLink = await CommunityService.generateInviteLink(Number(groupId));
        res.status(200).json({ status: "success", data: { inviteLink } });
    });

    // Admin endpoints
    static adminGetAllGroups = catchAsync(async (req: Request, res: Response) => {
        if (req.user?.role !== UserRole.ADMIN) throw new AppError("Admin access required", 403);
        const groups = await CommunityService.adminGetAllGroups();
        res.status(200).json({ status: "success", data: { groups } });
    });

     static adminGetAllMembers = catchAsync(async (req: Request, res: Response) => {
         if (req.user?.role !== UserRole.ADMIN) throw new AppError("Admin access required", 403);
         const { groupId } = req.query;
         let members;
         if (groupId) {
             // Fetch all members regardless of status for group management
             members = await CommunityMember.findAll({
                 where: { groupId: Number(groupId) },
                 include: [
                     { model: CommunityGroup, as: 'group', attributes: ['id', 'name'] },
                     { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                 ],
                 order: [['role', 'DESC'], ['joinedAt', 'ASC']],
             });
         } else {
             members = await CommunityMember.findAll({
                 include: [
                     { model: CommunityGroup, as: 'group', attributes: ['id', 'name'] },
                     { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                 ],
                 order: [['groupId', 'ASC']],
             });
         }
         res.status(200).json({ status: "success", data: { members } });
     });

     static adminBanUserFromGroup = catchAsync(async (req: Request, res: Response) => {
         if (req.user?.role !== UserRole.ADMIN) throw new AppError("Admin access required", 403);
         const { groupId, userId: targetUserId } = req.params;
         await CommunityMember.update({ status: MemberStatus.REMOVED }, { where: { groupId: Number(groupId), userId: Number(targetUserId) } });
         res.status(200).json({ status: "success", message: "User banned from group" });
     });

     static adminUnbanUserFromGroup = catchAsync(async (req: Request, res: Response) => {
         if (req.user?.role !== UserRole.ADMIN) throw new AppError("Admin access required", 403);
         const { groupId, userId: targetUserId } = req.params;
         await CommunityMember.update({ status: MemberStatus.ACTIVE }, { where: { groupId: Number(groupId), userId: Number(targetUserId) } });
         res.status(200).json({ status: "success", message: "User unbanned from group" });
     });

    static adminGetStats = catchAsync(async (req: Request, res: Response) => {
        if (req.user?.role !== UserRole.ADMIN) throw new AppError("Admin access required", 403);
        const stats = await CommunityService.adminGetStats();
        res.status(200).json({ status: "success", data: { stats } });
    });
}