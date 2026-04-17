import express, { Router, Request, Response, NextFunction } from "express";
import { sequelize } from "../config/sequelize.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { Op, QueryTypes } from "sequelize";
import path from "path";

const router: Router = express.Router();

const generateInviteLink = (): string => {
    return `https://admas.community/join/${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
};

// Get all groups (discover groups)
router.get("/groups", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        
        const query = `
            SELECT 
                cg.id, cg.name, cg.description, cg.avatar, cg.type, cg.privacy,
                cg.created_by as "createdBy", cg.invite_link as "inviteLink", 
                cg.member_count as "memberCount", cg.is_active as "isActive",
                cg.add_members_permission as "addMembersPermission",
                cg.created_at as "createdAt", cg.updated_at as "updatedAt",
                CASE WHEN cm.id IS NOT NULL THEN true ELSE false END as "isMember"
            FROM community_groups cg
            LEFT JOIN community_members cm ON cg.id = cm.group_id AND cm.user_id = $1 AND cm.status = 'active'
            WHERE cg.is_active = true
            ORDER BY cg.member_count DESC, cg.created_at DESC
            LIMIT 50
        `;
        
        const groups = await sequelize.query(query, {
            bind: [userId],
            type: QueryTypes.SELECT
        });

        res.json({ groups });
    } catch (error) {
        next(error);
    }
});

// Get my groups
router.get("/my-groups", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;

        const query = `
            SELECT cg.id, cg.name, cg.description, cg.avatar, cg.type, cg.privacy,
                   cg.created_by as "createdBy", cg.invite_link as "inviteLink", 
                   cg.member_count as "memberCount", cg.is_active as "isActive",
                   cg.add_members_permission as "addMembersPermission",
                   cg.created_at as "createdAt", cg.updated_at as "updatedAt",
                   cm.role, cm.joined_at as "joinedAt",
                   true as "isMember"
            FROM community_groups cg
            INNER JOIN community_members cm ON cg.id = cm.group_id
            WHERE cm.user_id = $1 AND cm.status = 'active' AND cg.is_active = true
            ORDER BY cm.joined_at DESC
        `;
        
        const groups = await sequelize.query(query, {
            bind: [userId],
            type: QueryTypes.SELECT
        });

        res.json({ groups });
    } catch (error) {
        next(error);
    }
});

// Create group
router.post("/groups", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { name, description, type, privacy, avatar, addMembersPermission } = req.body;

        if (!name || name.trim().length < 3) {
            return res.status(400).json({ error: "Group name must be at least 3 characters" });
        }

        const groupResult = await sequelize.query(
            `INSERT INTO community_groups (name, description, type, privacy, avatar, created_by, invite_link, member_count, is_active, add_members_permission, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 1, true, $8, NOW(), NOW())
             RETURNING *`,
            {
                bind: [
                    name.trim(),
                    description?.trim() || "",
                    type || "group",
                    privacy || "public",
                    avatar || "",
                    userId,
                    generateInviteLink(),
                    addMembersPermission || "admin"
                ],
                type: sequelize.QueryTypes.INSERT
            }
        );

        const group = groupResult[0][0];

        // Add creator as admin member
        await sequelize.query(
            `INSERT INTO community_members (group_id, user_id, role, status, joined_at, updated_at)
             VALUES ($1, $2, 'admin', 'active', NOW(), NOW())`,
            {
                bind: [group.id, userId],
                type: sequelize.QueryTypes.INSERT
            }
        );

        // Return full group data
        const fullGroup = {
            id: group.id,
            name: group.name,
            description: group.description,
            avatar: group.avatar,
            type: group.type,
            privacy: group.privacy,
            createdBy: group.created_by,
            inviteLink: group.invite_link,
            memberCount: 1,
            isActive: true,
            addMembersPermission: group.add_members_permission,
            createdAt: group.created_at,
            updatedAt: group.updated_at,
            isMember: true,
            isAdmin: true
        };

        res.status(201).json({ group: fullGroup });
    } catch (error) {
        next(error);
    }
});

// Get group details
router.get("/groups/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);

        const groupQuery = `
            SELECT id, name, description, avatar, type, privacy, created_by as "createdBy",
                   invite_link as "inviteLink", member_count as "memberCount", 
                   is_active as "isActive", add_members_permission as "addMembersPermission",
                   created_at as "createdAt", updated_at as "updatedAt" 
            FROM community_groups WHERE id = $1 AND is_active = true
        `;
        const groups = await sequelize.query(groupQuery, {
            bind: [groupId],
            type: QueryTypes.SELECT
        });

        if (groups.length === 0) {
            return res.status(404).json({ error: "Group not found" });
        }

        const group = groups[0];

        // Get membership info
        const memberQuery = `
            SELECT * FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active'
        `;
        const memberships = await sequelize.query(memberQuery, {
            bind: [groupId, userId],
            type: QueryTypes.SELECT
        });

        const isMember = memberships.length > 0;
        const membership = memberships[0] as any;
        const isAdmin = membership?.role === 'admin' || membership?.role === 'moderator';

        // Get all members
        const membersQuery = `
            SELECT cm.id, cm.group_id as "groupId", cm.user_id as "userId", cm.role, cm.status,
                   cm.joined_at as "joinedAt", cm.updated_at as "updatedAt",
                   u.id as "user_id", u.name, u.email 
            FROM community_members cm
            INNER JOIN users u ON cm.user_id = u.id
            WHERE cm.group_id = $1 AND cm.status = 'active'
            ORDER BY cm.role ASC, cm.joined_at ASC
        `;
        const members = await sequelize.query(membersQuery, {
            bind: [groupId],
            type: QueryTypes.SELECT
        });

        // Transform to include user object
        const transformedMembers = (members as any[]).map(m => ({
            id: m.id,
            groupId: m.groupId,
            userId: m.userId,
            role: m.role,
            status: m.status,
            joinedAt: m.joinedAt,
            user: {
                id: m.user_id,
                name: m.name,
                email: m.email
            }
        }));

        res.json({ 
            group: {
                ...group,
                members: transformedMembers,
                isMember,
                isAdmin
            }
        });
    } catch (error) {
        next(error);
    }
});

// Update group
router.put("/groups/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);
        const { name, description, avatar, privacy, addMembersPermission } = req.body;

        // Check admin
        const memberQuery = `
            SELECT * FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active' AND role IN ('admin', 'moderator')
        `;
        const members = await sequelize.query(memberQuery, {
            bind: [groupId, userId],
            type: QueryTypes.SELECT
        });

        if (members.length === 0) {
            return res.status(403).json({ error: "Only admins can update group" });
        }

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (name) {
            updates.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(description);
        }
        if (avatar !== undefined) {
            updates.push(`avatar = $${paramIndex++}`);
            values.push(avatar);
        }
        if (privacy) {
            updates.push(`privacy = $${paramIndex++}`);
            values.push(privacy);
        }
        if (addMembersPermission) {
            updates.push(`add_members_permission = $${paramIndex++}`);
            values.push(addMembersPermission);
        }

        if (updates.length > 0) {
            updates.push(`updated_at = NOW()`);
            values.push(groupId);
            
            await sequelize.query(
                `UPDATE community_groups SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
                { bind: values, type: sequelize.QueryTypes.UPDATE }
            );
        }

        const group = await sequelize.query(
            `SELECT id, name, description, avatar, type, privacy, created_by as "createdBy",
                    invite_link as "inviteLink", member_count as "memberCount", 
                    is_active as "isActive", add_members_permission as "addMembersPermission",
                    created_at as "createdAt", updated_at as "updatedAt" 
             FROM community_groups WHERE id = $1`,
            { bind: [groupId], type: QueryTypes.SELECT }
        );

        res.json({ group: group[0] });
    } catch (error) {
        next(error);
    }
});

// Delete group (only for admin/creator)
router.delete("/groups/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);

        // Get group details
        const groupQuery = `SELECT created_by FROM community_groups WHERE id = $1`;
        const groups = await sequelize.query(groupQuery, {
            bind: [groupId],
            type: QueryTypes.SELECT
        });

        if (groups.length === 0) {
            return res.status(404).json({ error: "Group not found" });
        }

        const group = groups[0] as any;

        // Check if user is admin or creator
        const memberQuery = `
            SELECT role FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active' AND role IN ('admin', 'moderator')
        `;
        const members = await sequelize.query(memberQuery, {
            bind: [groupId, userId],
            type: QueryTypes.SELECT
        });

        const isAdmin = members.length > 0;
        const isCreator = group.created_by === userId;

        if (!isAdmin && !isCreator) {
            return res.status(403).json({ error: "Only group creator or admins can delete the group" });
        }

        // Soft delete - set is_active to false
        await sequelize.query(
            `UPDATE community_groups SET is_active = false, updated_at = NOW() WHERE id = $1`,
            { bind: [groupId], type: sequelize.QueryTypes.UPDATE }
        );

        res.json({ message: "Group deleted successfully" });
    } catch (error) {
        next(error);
    }
});

// Join group
router.post("/groups/:id/join", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);

        const groupQuery = `SELECT * FROM community_groups WHERE id = $1 AND is_active = true`;
        const groups = await sequelize.query(groupQuery, {
            bind: [groupId],
            type: QueryTypes.SELECT
        });

        if (groups.length === 0) {
            return res.status(404).json({ error: "Group not found" });
        }

        // Check if already a member
        const existingQuery = `
            SELECT * FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active'
        `;
        const existing = await sequelize.query(existingQuery, {
            bind: [groupId, userId],
            type: QueryTypes.SELECT
        });

        if (existing.length > 0) {
            return res.status(400).json({ error: "Already a member" });
        }

        // Check if previously left
        const previousQuery = `
            SELECT * FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status IN ('left', 'removed')
        `;
        const previous = await sequelize.query(previousQuery, {
            bind: [groupId, userId],
            type: QueryTypes.SELECT
        });

        if (previous.length > 0) {
            await sequelize.query(
                `UPDATE community_members SET status = 'active', role = 'member', updated_at = NOW() 
                 WHERE group_id = $1 AND user_id = $2`,
                { bind: [groupId, userId], type: sequelize.QueryTypes.UPDATE }
            );
        } else {
            await sequelize.query(
                `INSERT INTO community_members (group_id, user_id, role, status, joined_at, updated_at)
                 VALUES ($1, $2, 'member', 'active', NOW(), NOW())`,
                { bind: [groupId, userId], type: sequelize.QueryTypes.INSERT }
            );
        }

        await sequelize.query(
            `UPDATE community_groups SET member_count = member_count + 1 WHERE id = $1`,
            { bind: [groupId], type: sequelize.QueryTypes.UPDATE }
        );

        res.json({ message: "Joined successfully" });
    } catch (error) {
        next(error);
    }
});

// Leave group
router.post("/groups/:id/leave", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);

        const membershipQuery = `
            SELECT cm.*, cg.created_by
            FROM community_members cm
            INNER JOIN community_groups cg ON cm.group_id = cg.id
            WHERE cm.group_id = $1 AND cm.user_id = $2 AND cm.status = 'active'
        `;
        const memberships = await sequelize.query(membershipQuery, {
            bind: [groupId, userId],
            type: QueryTypes.SELECT
        });

        if (memberships.length === 0) {
            return res.status(400).json({ error: "Not a member of this group" });
        }

        const membership = memberships[0] as any;
        if (membership.created_by === userId) {
            return res.status(400).json({ error: "Group creator cannot leave. Please delete the group instead." });
        }

        await sequelize.query(
            `UPDATE community_members SET status = 'left', updated_at = NOW() 
             WHERE group_id = $1 AND user_id = $2`,
            { bind: [groupId, userId], type: sequelize.QueryTypes.UPDATE }
        );

        await sequelize.query(
            `UPDATE community_groups SET member_count = GREATEST(member_count - 1, 0) WHERE id = $1`,
            { bind: [groupId], type: sequelize.QueryTypes.UPDATE }
        );

        res.json({ message: "Left successfully" });
    } catch (error) {
        next(error);
    }
});

// Get group messages
router.get("/groups/:id/messages", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    console.log('[community] GET /groups/:id/messages called', { params: req.params, query: req.query });
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);
        const { limit = 50, before } = req.query;

        console.log('[community] Checking membership for user:', userId, 'group:', groupId);

        // Check membership
        const memberQuery = `
            SELECT * FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active'
        `;
        const members = await sequelize.query(memberQuery, {
            bind: [groupId, userId],
            type: QueryTypes.SELECT
        });

        if (members.length === 0) {
            console.log('[community] User is not a member, returning 403');
            return res.status(403).json({ error: "You must be a member to view messages" });
        }

        let whereClause = "WHERE cm.group_id = $1";
        const bindParams: any[] = [groupId];

        if (before) {
            whereClause += " AND cm.created_at < $2";
            bindParams.push(before);
        }

        const query = `
            SELECT cm.id, cm.group_id, cm.sender_id, cm.content, cm.message_type, 
                   cm.attachment_url, cm.attachment_name, cm.is_pinned, cm.is_edited,
                   cm.reply_to_id, cm.reactions_count,
                   cm.created_at as "createdAt", cm.updated_at as "updatedAt", 
                   u.name, u.email
            FROM community_messages cm
            INNER JOIN users u ON cm.sender_id = u.id
            ${whereClause}
            ORDER BY cm.created_at DESC
            LIMIT ${parseInt(limit as string)}
        `;

        console.log('[community] Executing messages query');
        const messages = await sequelize.query(query, {
            bind: bindParams,
            type: QueryTypes.SELECT
        });

        console.log('[community] Got messages:', messages.length);

        // Get all reactions for these messages in a single query
        const messageIds = (messages as any[]).map(m => m.id);
        let reactionsMap: Record<number, any[]> = {};
        
        if (messageIds.length > 0) {
            const allReactionsQuery = `
                SELECT cmr.message_id, cmr.emoji, cmr.user_id, u.name
                FROM community_message_reactions cmr
                INNER JOIN users u ON cmr.user_id = u.id
                WHERE cmr.message_id IN (${messageIds.map((_, i) => `$${i + 1}`).join(', ')})
            `;
            const allReactions = await sequelize.query(allReactionsQuery, {
                bind: messageIds,
                type: QueryTypes.SELECT
            });
            
            // Group reactions by message_id
            for (const r of allReactions as any[]) {
                if (!reactionsMap[r.message_id]) {
                    reactionsMap[r.message_id] = [];
                }
                reactionsMap[r.message_id].push(r);
            }
        }

        // Attach reactions to messages
        for (const msg of messages as any[]) {
            msg.reactions = reactionsMap[msg.id] || [];
            msg.sender = { id: msg.sender_id, name: msg.name, email: msg.email };
            // Transform snake_case to camelCase for frontend compatibility
            msg.attachmentUrl = msg.attachment_url;
            msg.attachmentName = msg.attachment_name;
            msg.senderId = msg.sender_id;
            msg.groupId = msg.group_id;
            msg.replyToId = msg.reply_to_id;
            msg.isPinned = msg.is_pinned;
            msg.isEdited = msg.is_edited;
        }

        // Get reply-to messages (the originals being replied to)
        const replyToIds = (messages as any[]).filter(m => m.reply_to_id).map(m => m.reply_to_id);
        let repliesMap: Record<number, any> = {};
        
        if (replyToIds.length > 0) {
            const repliesQuery = `
                SELECT cm.id, cm.content, cm.sender_id, u.name, u.email
                FROM community_messages cm
                INNER JOIN users u ON cm.sender_id = u.id
                WHERE cm.id IN (${replyToIds.map((_, i) => `$${i + 1}`).join(', ')})
            `;
            const replies = await sequelize.query(repliesQuery, {
                bind: replyToIds,
                type: QueryTypes.SELECT
            });
            
            for (const r of replies as any[]) {
                repliesMap[r.id] = {
                    id: r.id,
                    content: r.content,
                    sender: { id: r.sender_id, name: r.name, email: r.email }
                };
            }
        }

        // Attach replyTo info to messages
        for (const msg of messages as any[]) {
            if (msg.reply_to_id) {
                msg.replyTo = repliesMap[msg.reply_to_id] || null;
            }
        }

        console.log('[community] Returning messages');
        res.json({ messages: messages.reverse() });
    } catch (error) {
        console.error('[community] Error fetching messages:', error);
        next(error);
    }
});

// Send message
router.post("/groups/:id/messages", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);
        
        console.log('[community] POST message - req.body:', JSON.stringify(req.body));
        console.log('[community] POST message - req.files:', JSON.stringify((req as any).files));
        console.log('[community] POST message - req.file:', JSON.stringify((req as any).file));
        console.log('[community] POST message - content-type:', req.get('content-type'));
        
        // Handle both regular JSON body and FormData
        const body = req.body || {};
        let content = body.content;
        let attachmentUrl = body.attachmentUrl;
        let attachmentName = body.attachmentName;
        const replyToId = body.replyToId;
        let messageType = body.messageType || "text";

        // Handle file upload if present - check both files.file and file (express-fileupload)
        const uploadedFile = (req as any).files?.file || (req as any).file;
        if (uploadedFile) {
            console.log('[community] File detected:', uploadedFile.name, uploadedFile.size, uploadedFile.mimetype);
            attachmentName = uploadedFile.name;
            
            // Generate a unique filename to avoid conflicts
            const uniqueFileName = `${Date.now()}-${uploadedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            
            // Save file to uploads directory
            const uploadsDir = path.join(process.cwd(), 'uploads');
            const filePath = path.join(uploadsDir, uniqueFileName);
            
            // Move the file to the uploads directory
            await uploadedFile.mv(filePath);
            
            // Use the request protocol and host to build full URL
            const protocol = req.protocol || 'http';
            const host = req.get('host') || req.headers.host || 'localhost:3001';
            attachmentUrl = `${protocol}://${host}/uploads/${uniqueFileName}`;
            
            // Determine message type based on file
            if (uploadedFile.mimetype?.startsWith('image/')) {
                messageType = 'image';
            } else {
                messageType = 'file';
            }
            
            console.log('[community] File uploaded:', uploadedFile.name, uploadedFile.mimetype, uploadedFile.size, 'URL:', attachmentUrl, 'saved to:', filePath);
        }

        console.log('[community] Sending message - content:', content, 'attachmentName:', attachmentName, 'attachmentUrl:', attachmentUrl);

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: "Message content is required" });
        }

        // Check membership
        const memberQuery = `
            SELECT * FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active'
        `;
        const members = await sequelize.query(memberQuery, {
            bind: [groupId, userId],
            type: QueryTypes.SELECT
        });

        if (members.length === 0) {
            return res.status(403).json({ error: "You must be a member to send messages" });
        }

        const result = await sequelize.query(
            `INSERT INTO community_messages (group_id, sender_id, content, message_type, attachment_url, attachment_name, reply_to_id, is_pinned, is_edited, reactions_count, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, false, false, 0, NOW(), NOW())
             RETURNING *`,
            {
                bind: [
                    groupId,
                    userId,
                    content.trim(),
                    messageType,
                    attachmentUrl || null,
                    attachmentName || null,
                    replyToId || null
                ],
                type: sequelize.QueryTypes.INSERT
            }
        );

        const message = result[0][0] as any;

        // Get sender info
        const userQuery = `SELECT id, name, email FROM users WHERE id = $1`;
        const users = await sequelize.query(userQuery, {
            bind: [userId],
            type: QueryTypes.SELECT
        });

        if (users[0]?.[0]) {
            message.sender = users[0][0];
        }

        // Transform snake_case to camelCase for frontend compatibility
        message.attachmentUrl = message.attachment_url;
        message.attachmentName = message.attachment_name;
        message.reactionCount = message.reactions_count;
        message.replyToId = message.reply_to_id;
        message.isPinned = message.is_pinned;
        message.isEdited = message.is_edited;
        message.senderId = message.sender_id;
        message.groupId = message.group_id;
        message.createdAt = message.created_at;
        message.updatedAt = message.updated_at;

        console.log('[community] Created message with attachment:', { attachmentUrl: message.attachment_url, attachmentName: message.attachment_name, messageType: message.message_type });

        res.status(201).json({ message });
    } catch (error) {
        console.error('[community] Error sending message:', error);
        next(error);
    }
});

// Edit message
router.put("/groups/:id/messages/:messageId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);
        const messageId = parseInt(req.params.messageId);
        const { content } = req.body;

        console.log('[community] Edit message - userId:', userId, 'groupId:', groupId, 'messageId:', messageId, 'content:', content);

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: "Message content is required" });
        }

        // Check membership
        const memberQuery = `
            SELECT * FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active'
        `;
        const members = await sequelize.query(memberQuery, {
            bind: [groupId, userId],
            type: QueryTypes.SELECT
        });
        
        console.log('[community] Members check:', members);

        if (members.length === 0) {
            return res.status(403).json({ error: "You must be a member to edit messages" });
        }

        // Check if user owns the message
        const msgQuery = `SELECT * FROM community_messages WHERE id = $1 AND group_id = $2`;
        const messages = await sequelize.query(msgQuery, {
            bind: [messageId, groupId],
            type: QueryTypes.SELECT
        });

        if (messages.length === 0) {
            return res.status(404).json({ error: "Message not found" });
        }

        const message = messages[0] as any;
        if (message.sender_id !== userId) {
            return res.status(403).json({ error: "You can only edit your own messages" });
        }

        const updateResult = await sequelize.query(
            `UPDATE community_messages SET content = $1, is_edited = true, updated_at = NOW() WHERE id = $2`,
            { 
                bind: [content.trim(), messageId], 
                type: sequelize.QueryTypes.UPDATE 
            }
        );

        const updated = await sequelize.query(
            `SELECT * FROM community_messages WHERE id = $1`,
            { bind: [messageId], type: QueryTypes.SELECT }
        );

        const users = await sequelize.query(
            `SELECT id, name, email FROM users WHERE id = $1`,
            { bind: [userId], type: QueryTypes.SELECT }
        );

        let result = null;
        if (Array.isArray(updated) && updated[0]?.[0]) {
            result = updated[0][0];
        } else if (Array.isArray(updated) && updated[0]) {
            result = updated[0];
        }
        
        if (result && users[0]?.[0]) {
            result.sender = users[0][0];
        }

        res.json({ message: result });
    } catch (error) {
        next(error);
    }
});

// Delete message
router.delete("/groups/:id/messages/:messageId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);
        const messageId = parseInt(req.params.messageId);

        const msgQuery = `SELECT * FROM community_messages WHERE id = $1 AND group_id = $2`;
        const messages = await sequelize.query(msgQuery, {
            bind: [messageId, groupId],
            type: QueryTypes.SELECT
        });

        if (messages.length === 0) {
            return res.status(404).json({ error: "Message not found" });
        }

        const message = messages[0] as any;
        let canDelete = message.sender_id === userId;

        if (!canDelete) {
            const adminQuery = `
                SELECT * FROM community_members 
                WHERE group_id = $1 AND user_id = $2 AND status = 'active' AND role IN ('admin', 'moderator')
            `;
            const admins = await sequelize.query(adminQuery, {
                bind: [groupId, userId],
                type: QueryTypes.SELECT
            });
            canDelete = admins.length > 0;
        }

        if (!canDelete) {
            return res.status(403).json({ error: "You cannot delete this message" });
        }

        await sequelize.query(`DELETE FROM community_messages WHERE id = $1`, {
            bind: [messageId],
            type: sequelize.QueryTypes.DELETE
        });

        res.json({ message: "Message deleted" });
    } catch (error) {
        next(error);
    }
});

// React to message
router.post("/groups/:id/messages/:messageId/react", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);
        const messageId = parseInt(req.params.messageId);
        const { emoji } = req.body;

        if (!emoji) {
            return res.status(400).json({ error: "Emoji is required" });
        }

        const msgQuery = `SELECT * FROM community_messages WHERE id = $1 AND group_id = $2`;
        const messages = await sequelize.query(msgQuery, {
            bind: [messageId, groupId],
            type: QueryTypes.SELECT
        });

        if (messages.length === 0) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Check if already reacted
        const existingQuery = `
            SELECT * FROM community_message_reactions 
            WHERE message_id = $1 AND user_id = $2 AND emoji = $3
        `;
        const existing = await sequelize.query(existingQuery, {
            bind: [messageId, userId, emoji],
            type: QueryTypes.SELECT
        });

        if (existing.length > 0) {
            // Remove reaction
            await sequelize.query(
                `DELETE FROM community_message_reactions WHERE message_id = $1 AND user_id = $2 AND emoji = $3`,
                { bind: [messageId, userId, emoji], type: sequelize.QueryTypes.DELETE }
            );
            await sequelize.query(
                `UPDATE community_messages SET reactions_count = GREATEST(reactions_count - 1, 0) WHERE id = $1`,
                { bind: [messageId], type: sequelize.QueryTypes.UPDATE }
            );
            return res.json({ message: "Reaction removed" });
        }

        // Add reaction
        await sequelize.query(
            `INSERT INTO community_message_reactions (message_id, user_id, emoji, created_at)
             VALUES ($1, $2, $3, NOW())`,
            { bind: [messageId, userId, emoji], type: sequelize.QueryTypes.INSERT }
        );
        
        await sequelize.query(
            `UPDATE community_messages SET reactions_count = reactions_count + 1 WHERE id = $1`,
            { bind: [messageId], type: sequelize.QueryTypes.UPDATE }
        );

        res.json({ message: "Reaction added" });
    } catch (error) {
        next(error);
    }
});

// Pin message
router.post("/groups/:id/messages/:messageId/pin", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);
        const messageId = parseInt(req.params.messageId);

        const adminQuery = `
            SELECT * FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active' AND role IN ('admin', 'moderator')
        `;
        const admins = await sequelize.query(adminQuery, {
            bind: [groupId, userId],
            type: QueryTypes.SELECT
        });

        if (admins.length === 0) {
            return res.status(403).json({ error: "Only admins can pin messages" });
        }

        const msgQuery = `SELECT * FROM community_messages WHERE id = $1 AND group_id = $2`;
        const messages = await sequelize.query(msgQuery, {
            bind: [messageId, groupId],
            type: QueryTypes.SELECT
        });

        if (messages.length === 0) {
            return res.status(404).json({ error: "Message not found" });
        }

        await sequelize.query(
            `UPDATE community_messages SET is_pinned = true, updated_at = NOW() WHERE id = $1`,
            { bind: [messageId], type: sequelize.QueryTypes.UPDATE }
        );

        const updated = await sequelize.query(
            `SELECT * FROM community_messages WHERE id = $1`,
            { bind: [messageId], type: QueryTypes.SELECT }
        );

        res.json({ message: updated[0] });
    } catch (error) {
        next(error);
    }
});

// Search groups
router.get("/groups/search", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { q } = req.query;

        if (!q || (q as string).trim().length < 2) {
            return res.status(400).json({ error: "Search query must be at least 2 characters" });
        }

        const searchQuery = `
            SELECT 
                cg.*,
                CASE WHEN cm.id IS NOT NULL THEN true ELSE false END as "isMember"
            FROM community_groups cg
            LEFT JOIN community_members cm ON cg.id = cm.group_id AND cm.user_id = $1 AND cm.status = 'active'
            WHERE cg.is_active = true AND cg.name ILIKE $2
            ORDER BY cg.member_count DESC
            LIMIT 20
        `;
        
        const groups = await sequelize.query(searchQuery, {
            bind: [userId, `%${q}%`],
            type: QueryTypes.SELECT
        });

        res.json({ groups });
    } catch (error) {
        next(error);
    }
});

// Get users to add to group (for admin to search)
router.get("/groups/:id/users", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);
        const { q, limit = 50 } = req.query;

        // Get group details to check permission
        const groupQuery = `SELECT add_members_permission, created_by FROM community_groups WHERE id = $1`;
        const groups = await sequelize.query(groupQuery, {
            bind: [groupId],
            type: QueryTypes.SELECT
        });

        if (groups.length === 0) {
            return res.status(404).json({ error: "Group not found" });
        }

        const group = groups[0] as any;
        
        // Check if user is a member, admin, or creator (anyone in the group can see users list)
        const memberQuery = `
            SELECT role FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active'
        `;
        const members = await sequelize.query(memberQuery, {
            bind: [groupId, userId],
            type: QueryTypes.SELECT
        });

        const isCreator = group.created_by === userId;
        const isMember = members.length > 0;
        const userRole = members[0]?.role;

        // If not a member and not creator, deny access
        if (!isMember && !isCreator) {
            return res.status(403).json({ error: "You must be a member to view users" });
        }

        // Get users not in group (excluding already members)
        let userQuery: string;
        let bindParams: any[];

        if (q && (q as string).trim().length >= 1) {
            userQuery = `
                SELECT id, name, email FROM users 
                WHERE (name ILIKE $1 OR email ILIKE $1)
                AND id NOT IN (
                    SELECT user_id FROM community_members WHERE group_id = $2 AND status = 'active'
                )
                AND id != $3
                LIMIT $4
            `;
            bindParams = [`%${q}%`, groupId, userId, parseInt(limit as string) || 50];
        } else {
            // Show all users not in group when no search query
            userQuery = `
                SELECT id, name, email FROM users 
                WHERE id NOT IN (
                    SELECT user_id FROM community_members WHERE group_id = $1 AND status = 'active'
                )
                AND id != $2
                ORDER BY name ASC
                LIMIT 50
            `;
            bindParams = [groupId, userId];
        }

        const users = await sequelize.query(userQuery, {
            bind: bindParams,
            type: QueryTypes.SELECT
        });

        res.json({ users });
    } catch (error) {
        next(error);
    }
});

// Add member to group (Telegram-style: by user ID)
router.post("/groups/:id/members", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);
        const { userId: targetUserId, role = 'member' } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Get group details to check permission
        const groupInfoQuery = `SELECT add_members_permission FROM community_groups WHERE id = $1`;
        const groupInfo = await sequelize.query(groupInfoQuery, {
            bind: [groupId],
            type: QueryTypes.SELECT
        });

        if (groupInfo.length === 0) {
            return res.status(404).json({ error: "Group not found" });
        }

        const groupInfoData = groupInfo[0] as any;
        
        // Check if user can add members based on group permission
        let canAddMembers = false;
        
        if (groupInfoData.add_members_permission === 'all') {
            // Any active member can add
            const memberQuery = `
                SELECT id FROM community_members 
                WHERE group_id = $1 AND user_id = $2 AND status = 'active'
            `;
            const members = await sequelize.query(memberQuery, {
                bind: [groupId, userId],
                type: QueryTypes.SELECT
            });
            canAddMembers = members.length > 0;
        } else {
            // Only admins can add
            const adminQuery = `
                SELECT id FROM community_members 
                WHERE group_id = $1 AND user_id = $2 AND status = 'active' AND role IN ('admin', 'moderator')
            `;
            const admins = await sequelize.query(adminQuery, {
                bind: [groupId, userId],
                type: QueryTypes.SELECT
            });
            canAddMembers = admins.length > 0;
        }

        if (!canAddMembers) {
            return res.status(403).json({ error: "You don't have permission to add members" });
        }

        // Check if group exists
        const groupQuery = `SELECT * FROM community_groups WHERE id = $1 AND is_active = true`;
        const groups = await sequelize.query(groupQuery, {
            bind: [groupId],
            type: QueryTypes.SELECT
        });

        if (groups.length === 0) {
            return res.status(404).json({ error: "Group not found" });
        }

        // Check if user exists
        const userQuery = `SELECT id, name, email FROM users WHERE id = $1`;
        const users = await sequelize.query(userQuery, {
            bind: [targetUserId],
            type: QueryTypes.SELECT
        });

        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if already a member
        const existingQuery = `
            SELECT * FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active'
        `;
        const existing = await sequelize.query(existingQuery, {
            bind: [groupId, targetUserId],
            type: QueryTypes.SELECT
        });

        if (existing.length > 0) {
            return res.status(400).json({ error: "User is already a member" });
        }

        // Check if previously left - reactivate
        const previousQuery = `
            SELECT * FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status IN ('left', 'removed')
        `;
        const previous = await sequelize.query(previousQuery, {
            bind: [groupId, targetUserId],
            type: QueryTypes.SELECT
        });

        if (previous.length > 0) {
            await sequelize.query(
                `UPDATE community_members SET status = 'active', role = $1, updated_at = NOW() 
                 WHERE group_id = $2 AND user_id = $3`,
                { bind: [role, groupId, targetUserId], type: sequelize.QueryTypes.UPDATE }
            );
        } else {
            await sequelize.query(
                `INSERT INTO community_members (group_id, user_id, role, status, joined_at, updated_at)
                 VALUES ($1, $2, $3, 'active', NOW(), NOW())`,
                { bind: [groupId, targetUserId, role], type: sequelize.QueryTypes.INSERT }
            );
        }

        // Update member count
        await sequelize.query(
            `UPDATE community_groups SET member_count = member_count + 1 WHERE id = $1`,
            { bind: [groupId], type: sequelize.QueryTypes.UPDATE }
        );

        const newMember = {
            id: previous.length > 0 ? previous[0].id : Date.now(),
            group_id: groupId,
            user_id: targetUserId,
            role,
            status: 'active',
            joined_at: new Date(),
            updated_at: new Date(),
            user: users[0]
        };

        res.status(201).json({ member: newMember });
    } catch (error) {
        next(error);
    }
});

// Remove member from group
router.delete("/groups/:id/members/:userId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);
        const targetUserId = parseInt(req.params.userId);

        // Check if user is admin
        const adminQuery = `
            SELECT * FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active' AND role IN ('admin', 'moderator')
        `;
        const admins = await sequelize.query(adminQuery, {
            bind: [groupId, userId],
            type: QueryTypes.SELECT
        });

        if (admins.length === 0) {
            return res.status(403).json({ error: "Only admins can remove members" });
        }

        // Cannot remove the group creator
        const groupQuery = `SELECT created_by FROM community_groups WHERE id = $1`;
        const groups = await sequelize.query(groupQuery, {
            bind: [groupId],
            type: QueryTypes.SELECT
        });

        if (groups.length === 0) {
            return res.status(404).json({ error: "Group not found" });
        }

        const group = groups[0] as any;
        if (group.created_by === targetUserId) {
            return res.status(400).json({ error: "Cannot remove group creator" });
        }

        // Check if target is admin and current user is not admin
        const targetQuery = `
            SELECT role FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active'
        `;
        const targets = await sequelize.query(targetQuery, {
            bind: [groupId, targetUserId],
            type: QueryTypes.SELECT
        });

        if (targets.length === 0) {
            return res.status(404).json({ error: "Member not found" });
        }

        const target = targets[0] as any;
        const currentAdmin = admins[0] as any;

        // Moderator can't remove admin
        if (target.role === 'admin' && currentAdmin.role !== 'admin') {
            return res.status(403).json({ error: "Cannot remove admin" });
        }

        await sequelize.query(
            `UPDATE community_members SET status = 'removed', updated_at = NOW() 
             WHERE group_id = $1 AND user_id = $2`,
            { bind: [groupId, targetUserId], type: sequelize.QueryTypes.UPDATE }
        );

        await sequelize.query(
            `UPDATE community_groups SET member_count = GREATEST(member_count - 1, 0) WHERE id = $1`,
            { bind: [groupId], type: sequelize.QueryTypes.UPDATE }
        );

        res.json({ message: "Member removed successfully" });
    } catch (error) {
        next(error);
    }
});

// Update member role
router.put("/groups/:id/members/:userId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);
        const targetUserId = parseInt(req.params.userId);
        const { role } = req.body;

        if (!role || !['admin', 'moderator', 'member'].includes(role)) {
            return res.status(400).json({ error: "Invalid role. Must be 'admin', 'moderator', or 'member'" });
        }

        // Check if current user is admin
        const adminQuery = `
            SELECT * FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active' AND role = 'admin'
        `;
        const admins = await sequelize.query(adminQuery, {
            bind: [groupId, userId],
            type: QueryTypes.SELECT
        });

        if (admins.length === 0) {
            return res.status(403).json({ error: "Only admins can change member roles" });
        }

        // Check if target is member
        const targetQuery = `
            SELECT * FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active'
        `;
        const targets = await sequelize.query(targetQuery, {
            bind: [groupId, targetUserId],
            type: QueryTypes.SELECT
        });

        if (targets.length === 0) {
            return res.status(404).json({ error: "Member not found" });
        }

        await sequelize.query(
            `UPDATE community_members SET role = $1, updated_at = NOW() 
             WHERE group_id = $2 AND user_id = $3`,
            { bind: [role, groupId, targetUserId], type: sequelize.QueryTypes.UPDATE }
        );

        res.json({ message: "Role updated successfully" });
    } catch (error) {
        next(error);
    }
});

// Get invite link
router.get("/groups/:id/invite", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);

        // First check if group exists
        const groupQuery = `SELECT invite_link, created_by FROM community_groups WHERE id = $1`;
        const groups = await sequelize.query(groupQuery, {
            bind: [groupId],
            type: QueryTypes.SELECT
        });

        if (groups.length === 0) {
            return res.status(404).json({ error: "Group not found" });
        }

        const group = groups[0] as any;
        const isCreator = group.created_by === userId;

        // If not creator, check membership
        if (!isCreator) {
            const memberQuery = `
                SELECT id FROM community_members 
                WHERE group_id = $1 AND user_id = $2 AND status = 'active'
            `;
            const members = await sequelize.query(memberQuery, {
                bind: [groupId, userId],
                type: QueryTypes.SELECT
            });

            if (members.length === 0) {
                return res.status(403).json({ error: "You must be a member to get invite link" });
            }
        }

        res.json({ inviteLink: group.invite_link });
    } catch (error) {
        next(error);
    }
});

// Generate new invite link (admin only)
router.post("/groups/:id/invite", authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const groupId = parseInt(req.params.id);

        // Check if user is admin
        const adminQuery = `
            SELECT * FROM community_members 
            WHERE group_id = $1 AND user_id = $2 AND status = 'active' AND role IN ('admin', 'moderator')
        `;
        const admins = await sequelize.query(adminQuery, {
            bind: [groupId, userId],
            type: QueryTypes.SELECT
        });

        if (admins.length === 0) {
            return res.status(403).json({ error: "Only admins can generate invite links" });
        }

        const newInviteLink = generateInviteLink();

        await sequelize.query(
            `UPDATE community_groups SET invite_link = $1, updated_at = NOW() WHERE id = $2`,
            { bind: [newInviteLink, groupId], type: sequelize.QueryTypes.UPDATE }
        );

        res.json({ inviteLink: newInviteLink });
    } catch (error) {
        next(error);
    }
});

export default router;