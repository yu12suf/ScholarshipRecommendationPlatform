import { CommunityGroup, CommunityGroupType, CommunityPrivacy, AddMembersPermission } from "../models/CommunityGroup.js";
import { CommunityMember, MemberRole, MemberStatus } from "../models/CommunityMember.js";
import { CommunityMessage } from "../models/CommunityMessage.js";
import { MessageReaction } from "../models/MessageReaction.js";
import { User } from "../models/User.js";
import { Op } from "sequelize";
import { AppError } from "../errors/AppError.js";

export class CommunityService {
    static async generateInviteLink(groupId: number): Promise<string> {
        const group = await CommunityGroup.findByPk(groupId);
        if (!group) throw new AppError("Group not found", 404);
        const code = Math.random().toString(36).substring(2, 10);
        await group.update({ inviteLink: code });
        return `${group.id}/${code}`;
    }

    static async getAllGroups(userId?: number, userRole?: string) {
        const where: any = {};
        // Only filter active groups for non-admin users (members browsing)
        if (userId && userRole !== 'admin') {
            where.isActive = true;
        }
        // For admin (userId may be undefined or role=admin), show all groups

        // Build includes conditionally
        const includes: any[] = [
            { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        ];

        if (userId) {
            includes.push({
                model: CommunityMember,
                as: 'members',
                where: { status: MemberStatus.ACTIVE },
                attributes: ['userId', 'role', 'status'],
            });
        } else {
            includes.push({
                model: CommunityMember,
                as: 'members',
                attributes: ['userId', 'role', 'status'],
            });
        }

        const groups = await CommunityGroup.findAll({
            where,
            include: includes,
            order: [['createdAt', 'DESC']],
        });

        return groups.map(g => {
            const members = (g as any).members || [];
            return {
                ...g.get(),
                memberCount: members.filter((m: any) => m.status === MemberStatus.ACTIVE).length,
                isMember: members.some((m: any) => m.userId === userId && m.status === MemberStatus.ACTIVE),
                isAdmin: members.some((m: any) => m.userId === userId && m.role === MemberRole.ADMIN),
            };
        });
    }

    static async getMyGroups(userId: number) {
        const memberships = await CommunityMember.findAll({
            where: { userId, status: MemberStatus.ACTIVE },
            include: [{
                model: CommunityGroup,
                as: 'group',
                include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email'] }]
            }],
            order: [['group', 'createdAt', 'DESC']],
        });

        const results = await Promise.all(memberships.map(async (m) => {
            const group = m.group as any;
            if (!group) {
                console.warn(`Membership for user ${userId} has missing group (membership id: ${m.id})`);
                return null;
            }
            const count = await CommunityMember.count({ where: { groupId: group.id, status: MemberStatus.ACTIVE } });
            return { ...group.get(), memberCount: count, role: m.role, isMember: true, isAdmin: m.role === MemberRole.ADMIN };
        }));
        return results.filter(r => r !== null);
    }

    static async createGroup(userId: number, data: any) {
        const code = Math.random().toString(36).substring(2, 10);
        const group = await CommunityGroup.create({
            name: data.name,
            description: data.description,
            type: data.type || CommunityGroupType.GROUP,
            privacy: data.privacy || CommunityPrivacy.PUBLIC,
            avatar: data.avatar || '',
            addMembersPermission: data.addMembersPermission || AddMembersPermission.ADMIN,
            createdBy: userId,
            inviteLink: code,
            isActive: true,
        });
        await CommunityMember.create({ groupId: group.id, userId, role: MemberRole.ADMIN, status: MemberStatus.ACTIVE });
        // Return augmented group object with memberCount and membership flags
        return {
            ...group.get(),
            memberCount: 1,
            isMember: true,
            isAdmin: true,
        };
    }

    static async getGroupDetails(groupId: number, userId?: number) {
        const group = await CommunityGroup.findByPk(groupId, {
            include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatarUrl'] }],
        });
        if (!group) throw new AppError("Group not found", 404);

        const members = await CommunityMember.findAll({
            where: { groupId, status: MemberStatus.ACTIVE },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] }],
            order: [['role', 'DESC'], ['joinedAt', 'ASC']],
        });

        const userMembership = userId ? await CommunityMember.findOne({ where: { groupId, userId, status: MemberStatus.ACTIVE } }) : null;

        return {
            ...group.get(),
            members: members.map(m => ({ id: m.id, userId: m.userId, role: m.role, status: m.status, joinedAt: m.joinedAt, user: m.user?.get() || null })),
            memberCount: members.length,
            isMember: !!userMembership,
            isAdmin: userMembership?.role === MemberRole.ADMIN,
        };
    }

    static async updateGroup(groupId: number, userId: number, userRole: string, data: any) {
        const group = await CommunityGroup.findByPk(groupId);
        if (!group) throw new AppError("Group not found", 404);
        // Allow system admin to edit any group
        if (userRole !== 'admin') {
            const membership = await CommunityMember.findOne({ where: { groupId, userId, status: MemberStatus.ACTIVE } });
            if (!membership || membership.role !== MemberRole.ADMIN) throw new AppError("Only group admin can edit", 403);
        }
        await group.update(data);
        return group;
    }

    static async deleteGroup(groupId: number) {
        const group = await CommunityGroup.findByPk(groupId);
        if (!group) throw new AppError("Group not found", 404);
        await group.destroy();
        return { success: true };
    }

    static async toggleGroupActive(groupId: number, isActive: boolean) {
        const group = await CommunityGroup.findByPk(groupId);
        if (!group) throw new AppError("Group not found", 404);
        await group.update({ isActive });
        return group;
    }

    static async joinGroup(groupId: number, userId: number) {
        const group = await CommunityGroup.findByPk(groupId);
        if (!group) throw new AppError("Group not found", 404);

        // Admin can join regardless of active/private status
        const user = await User.findByPk(userId);
        const isAdmin = user?.role === 'admin';
        if (!isAdmin) {
            if (!group.isActive) throw new AppError("Group is inactive", 400);
            if (group.privacy === CommunityPrivacy.PRIVATE) throw new AppError("Group is private", 400);
        }

        const existing = await CommunityMember.findOne({ where: { groupId, userId } });
        if (existing) {
            if (existing.status === MemberStatus.ACTIVE) {
                // Idempotent: already a member
                const count = await CommunityMember.count({ where: { groupId, status: MemberStatus.ACTIVE } });
                return { success: true, message: "Already a member", memberCount: count };
            }
            if (existing.status === MemberStatus.REMOVED) throw new AppError("You are banned from this group", 403);
            // Reactivate LEFT status
            await existing.update({ status: MemberStatus.ACTIVE });
        } else {
            await CommunityMember.create({ groupId, userId, role: MemberRole.MEMBER, status: MemberStatus.ACTIVE });
        }

        this.emitToUser(userId, 'group_joined', { groupId, groupName: group.name });
        const memberCount = await CommunityMember.count({ where: { groupId, status: MemberStatus.ACTIVE } });
        return { success: true, message: "Joined group", memberCount };
    }

    static async leaveGroup(groupId: number, userId: number) {
        const membership = await CommunityMember.findOne({ where: { groupId, userId, status: MemberStatus.ACTIVE } });
        if (!membership) throw new AppError("Not a member", 404);
        await membership.update({ status: MemberStatus.LEFT });
        this.emitToUser(userId, 'group_left', { groupId });
        const memberCount = await CommunityMember.count({ where: { groupId, status: MemberStatus.ACTIVE } });
        return { success: true, message: "Left group", memberCount };
    }

    static async addMember(groupId: number, adderUserId: number, targetUserId: number, role: MemberRole = MemberRole.MEMBER) {
        const group = await CommunityGroup.findByPk(groupId);
        if (!group) throw new AppError("Group not found", 404);

        // Allow system admin to add members without being a group member
        const adderUser = await User.findByPk(adderUserId);
        if (!adderUser || adderUser.role !== 'admin') {
            // Non-admin must be an active group member with proper permission
            const adder = await CommunityMember.findOne({ where: { groupId, userId: adderUserId, status: MemberStatus.ACTIVE } });
            if (!adder || (adder.role !== MemberRole.ADMIN && group.addMembersPermission !== AddMembersPermission.ALL)) {
                throw new AppError("No permission to add members", 403);
            }
        }

        const targetUser = await User.findByPk(targetUserId);
        if (!targetUser) throw new AppError("User not found", 404);

        const existing = await CommunityMember.findOne({ where: { groupId, userId: targetUserId } });
        if (existing) {
            if (existing.status === MemberStatus.ACTIVE) {
                // Already a member — idempotent success
                return { success: true, message: "Already a member", membership: existing };
            }
            if (existing.status === MemberStatus.REMOVED) throw new AppError("User is banned and cannot be re-added", 403);
            await existing.update({ status: MemberStatus.ACTIVE, role });
        } else {
            await CommunityMember.create({ groupId, userId: targetUserId, role, status: MemberStatus.ACTIVE });
        }

        this.emitToUser(targetUserId, 'group_joined', { groupId, groupName: group.name });
        const memberCount = await CommunityMember.count({ where: { groupId, status: MemberStatus.ACTIVE } });
        return { success: true, message: "Member added", memberCount };
    }

    static async removeMember(groupId: number, removerUserId: number, targetUserId: number) {
        // Allow system admin to remove members regardless of group membership
        const removerUser = await User.findByPk(removerUserId);
        if (!removerUser || removerUser.role !== 'admin') {
            const remover = await CommunityMember.findOne({ where: { groupId, userId: removerUserId, status: MemberStatus.ACTIVE } });
            if (!remover || remover.role !== MemberRole.ADMIN) throw new AppError("Only group admin can remove members", 403);
        }

        const target = await CommunityMember.findOne({ where: { groupId, userId: targetUserId, status: MemberStatus.ACTIVE } });
        if (!target) throw new AppError("Member not found", 404);

        await target.update({ status: MemberStatus.REMOVED });
        this.emitToUser(targetUserId, 'group_left', { groupId });
        const memberCount = await CommunityMember.count({ where: { groupId, status: MemberStatus.ACTIVE } });
        return { success: true, message: "Member removed", memberCount };
    }

    static async unbanUserFromGroup(groupId: number, targetUserId: number) {
        const target = await CommunityMember.findOne({ where: { groupId, userId: targetUserId } });
        if (!target) throw new AppError("User was not a member of this group", 404);

        await target.update({ status: MemberStatus.ACTIVE });
        this.emitToUser(targetUserId, 'group_joined', { groupId });
        const memberCount = await CommunityMember.count({ where: { groupId, status: MemberStatus.ACTIVE } });
        return { success: true, message: "User unbanned", memberCount };
    }

    static async updateMemberRole(groupId: number, actorUserId: number, targetUserId: number, newRole: MemberRole) {
        const actor = await CommunityMember.findOne({ where: { groupId, userId: actorUserId, status: MemberStatus.ACTIVE } });
        if (!actor || actor.role !== MemberRole.ADMIN) throw new AppError("Only admin can change roles", 403);

        const target = await CommunityMember.findOne({ where: { groupId, userId: targetUserId, status: MemberStatus.ACTIVE } });
        if (!target) throw new AppError("Member not found", 404);

        await target.update({ role: newRole });
        return { success: true, message: "Role updated" };
    }

    static async searchGroups(query: string) {
        const groups = await CommunityGroup.findAll({
            where: { isActive: true, privacy: CommunityPrivacy.PUBLIC, [Op.or]: [{ name: { [Op.iLike]: `%${query}%` } }, { description: { [Op.iLike]: `%${query}%` } }] },
            include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email'] }],
            limit: 20,
        });

        return Promise.all(groups.map(async (g) => ({
            ...g.get(),
            memberCount: await CommunityMember.count({ where: { groupId: g.id, status: MemberStatus.ACTIVE } }),
        })));
    }

    static async getGroupMembers(groupId: number, requesterUserId: number) {
        const requester = await CommunityMember.findOne({ where: { groupId, userId: requesterUserId, status: MemberStatus.ACTIVE } });
        if (!requester) throw new AppError("You are not a member of this group", 403);

        const members = await CommunityMember.findAll({
            where: { groupId, status: MemberStatus.ACTIVE },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] }],
            order: [['role', 'DESC'], ['joinedAt', 'ASC']],
        });

        return members.map(m => ({ id: m.id, userId: m.userId, role: m.role, status: m.status, joinedAt: m.joinedAt, user: m.user?.get() || null }));
    }

    static async adminGetGroupMembers(groupId: number) {
        const members = await CommunityMember.findAll({
            where: { groupId, status: MemberStatus.ACTIVE },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatarUrl'] }],
            order: [['role', 'DESC'], ['joinedAt', 'ASC']],
        });
        return members.map(m => ({ id: m.id, userId: m.userId, role: m.role, status: m.status, joinedAt: m.joinedAt, user: m.user?.get() || null }));
    }

    static async getGroupNonMembers(groupId: number, query: string = '') {
        const existing = await CommunityMember.findAll({ where: { groupId, status: MemberStatus.ACTIVE }, attributes: ['userId'] });
        const memberIds = existing.map(m => m.userId);

        const whereClause: any = {};
        if (query) whereClause[Op.or] = [{ name: { [Op.iLike]: `%${query}%` } }, { email: { [Op.iLike]: `%${query}%` } }];
        if (memberIds.length > 0) whereClause.id = { [Op.notIn]: memberIds };

        return User.findAll({ where: whereClause, attributes: ['id', 'name', 'email'], limit: 20 });
    }

    // ========== MESSAGES ==========

    static async getGroupMessages(groupId: number, limit = 50, before?: string) {
        const where: any = { groupId };
        if (before) where.createdAt = { [Op.lt]: new Date(before) };

        const messages = await CommunityMessage.findAll({
            where,
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'avatarUrl'] },
                { model: CommunityMessage, as: 'replyTo', include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'avatarUrl'] }] },
            ],
            order: [['createdAt', 'DESC']],
            limit,
        });

        return messages.map(m => this.formatMessage(m));
    }

    static async sendMessage(groupId: number, senderId: number, data: any) {
        const membership = await CommunityMember.findOne({ where: { groupId, userId: senderId, status: MemberStatus.ACTIVE } });
        if (!membership) throw new AppError("Not a member", 403);

        const { content, messageType = 'text', attachmentUrl, attachmentName, replyToId } = data;

        const message = await CommunityMessage.create({
            groupId, senderId, content, messageType,
            attachmentUrl: attachmentUrl || null,
            attachmentName: attachmentName || null,
            replyToId: replyToId || null,
            reactionsCount: 0,
        });

        const full = await CommunityMessage.findByPk(message.id, {
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'avatarUrl'] },
                { model: CommunityMessage, as: 'replyTo', include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'avatarUrl'] }] },
            ],
        });

        this.emitToGroup(groupId, 'new_message', { message: this.formatMessage(full!) });
        return this.formatMessage(full!);
    }

    static async editMessage(groupId: number, messageId: number, userId: number, content: string) {
        const msg = await CommunityMessage.findByPk(messageId);
        if (!msg || msg.groupId !== groupId) throw new AppError("Message not found", 404);
        if (msg.senderId !== userId) throw new AppError("Can only edit own messages", 403);

        await msg.update({ content, isEdited: true });
        const updated = await CommunityMessage.findByPk(messageId, {
            include: [
                { model: User, as: 'sender', attributes: ['id', 'name', 'avatarUrl'] },
                { model: CommunityMessage, as: 'replyTo', include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'avatarUrl'] }] },
            ],
        });

        this.emitToGroup(groupId, 'message_edited', { message: this.formatMessage(updated!) });
        return this.formatMessage(updated!);
    }

    static async deleteMessage(groupId: number, messageId: number, userId: number, userRole: string) {
        const msg = await CommunityMessage.findByPk(messageId);
        if (!msg || msg.groupId !== groupId) throw new AppError("Message not found", 404);

        const isSender = msg.senderId === userId;
        const membership = await CommunityMember.findOne({ where: { groupId, userId, status: MemberStatus.ACTIVE } });
        const isGroupAdmin = membership?.role === MemberRole.ADMIN;
        const isSystemAdmin = userRole === 'admin';

        if (!isSender && !isGroupAdmin && !isSystemAdmin) throw new AppError("Cannot delete this message", 403);

        await MessageReaction.destroy({ where: { messageId } });
        await CommunityMessage.update({ content: '[Deleted]', isEdited: true }, { where: { replyToId: messageId } });
        await msg.destroy();

        this.emitToGroup(groupId, 'message_deleted', { messageId });
        return { success: true };
    }

    static async pinMessage(groupId: number, messageId: number, userId: number) {
        const msg = await CommunityMessage.findByPk(messageId);
        if (!msg || msg.groupId !== groupId) throw new AppError("Message not found", 404);

        const membership = await CommunityMember.findOne({ where: { groupId, userId, status: MemberStatus.ACTIVE } });
        if (!membership || membership.role !== MemberRole.ADMIN) throw new AppError("Only admins can pin", 403);

        await msg.update({ isPinned: !msg.isPinned });
        this.emitToGroup(groupId, 'message_pinned', { messageId, isPinned: msg.isPinned });
        return { success: true, isPinned: msg.isPinned };
    }

    static async reactToMessage(groupId: number, messageId: number, userId: number, emoji: string) {
        const msg = await CommunityMessage.findByPk(messageId);
        if (!msg || msg.groupId !== groupId) throw new AppError("Message not found", 404);

        const membership = await CommunityMember.findOne({ where: { groupId, userId, status: MemberStatus.ACTIVE } });
        if (!membership) throw new AppError("Not a member", 403);

        const existing = await MessageReaction.findOne({ where: { messageId, userId, emoji } });
        if (existing) {
            await existing.destroy();
            await msg.decrement('reactionsCount', { by: 1 });
        } else {
            await MessageReaction.create({ messageId, userId, emoji });
            await msg.increment('reactionsCount', { by: 1 });
        }

        const reactions = await MessageReaction.findAll({
            where: { messageId },
            include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
        });

        const reactionList = reactions.map(r => ({ emoji: r.emoji, userId: r.userId, user: (r.user as any).name }));
        this.emitToGroup(groupId, 'reaction_updated', { messageId, reactions: reactionList, reactionsCount: reactions.length });
        return { success: true, reactions: reactionList };
    }

    // Admin methods
    static async adminGetAllGroups() {
        return this.getAllGroups(undefined, 'admin');
    }

    static async adminGetStats() {
        const [totalGroups, totalMembers, totalMessages, activeGroups] = await Promise.all([
            CommunityGroup.count(),
            CommunityMember.count({ where: { status: MemberStatus.ACTIVE } }),
            CommunityMessage.count(),
            CommunityGroup.count({ where: { isActive: true } }),
        ]);
        return { totalGroups, activeGroups, totalMembers, totalMessages };
    }

    private static formatMessage(message: CommunityMessage | null) {
        if (!message) return null;
        const msg = message.get();
        return {
            ...msg,
            sender: message.sender ? (message.sender as any).get() : null,
            replyTo: message.replyTo ? {
                id: message.replyTo.id,
                content: message.replyTo.content,
                sender: message.replyTo.sender ? (message.replyTo.sender as any).get() : null,
            } : null,
            reactions: message.reactions ? message.reactions.map(r => ({ emoji: r.emoji, userId: r.userId, user: (r.user as any).name })) : [],
        };
    }

    private static emitToGroup(groupId: number, event: string, data: any) {
        try {
            const io = (global as any).socketIOInstance;
            if (io) io.to(`group_${groupId}`).emit(event, data);
        } catch { /* ignore */ }
    }

    private static emitToUser(userId: number, event: string, data: any) {
        try {
            const io = (global as any).socketIOInstance;
            if (io) io.to(`user_${userId}`).emit(event, data);
        } catch { /* ignore */ }
    }
}