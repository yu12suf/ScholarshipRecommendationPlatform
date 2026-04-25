import api from '@/lib/api';

export interface CommunityGroup {
  id: number;
  name: string;
  description: string;
  avatar: string;
  type: 'group' | 'channel';
  privacy: 'public' | 'private';
  createdBy: number;
  inviteLink: string;
  memberCount: number;
  isActive: boolean;
  addMembersPermission: 'admin' | 'all';
  isMember?: boolean;
  isAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
  role?: 'admin' | 'moderator' | 'member';
  [key: string]: any;
}

export interface CommunityMember {
  id: number;
  groupId: number;
  userId: number;
  role: 'admin' | 'moderator' | 'member';
  status: 'active' | 'left' | 'removed';
  joinedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CommunityMessage {
  id: number;
  groupId: number;
  senderId: number;
  sender?: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  content: string;
  messageType: 'text' | 'image' | 'file' | 'link';
  attachmentUrl: string;
  attachmentName: string;
  isPinned: boolean;
  isEdited: boolean;
  replyToId: number | null;
  replyTo?: {
    id: number;
    content: string;
    sender: {
      id: number;
      name: string;
      email: string;
      avatarUrl?: string;
    };
  };
  reactionsCount: number;
  reactions?: Array<{
    emoji: string;
    userId: number;
    user: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  type?: 'group' | 'channel';
  privacy?: 'public' | 'private';
  avatar?: string;
  addMembersPermission?: 'admin' | 'all';
}

export interface SendMessageData {
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'link';
  attachmentUrl?: string;
  attachmentName?: string;
  replyToId?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MessagePayload = SendMessageData | FormData | any;

export interface AddMemberData {
  userId: number;
  role?: 'admin' | 'moderator' | 'member';
}

export interface CommunityUser {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
}

export const communityApi = {
  // Groups
  getAllGroups: () => api.get<{ groups: CommunityGroup[] }>('/community/groups'),
  getMyGroups: () => api.get<{ groups: CommunityGroup[] }>('/community/my-groups'),
  createGroup: (data: CreateGroupData) => api.post<{ group: CommunityGroup }>('/community/groups', data),
  getGroupDetails: (id: number) => api.get<{ group: CommunityGroup & { members: CommunityMember[]; isMember: boolean; isAdmin: boolean } }>(`/community/groups/${id}`),
  updateGroup: (id: number, data: Partial<CreateGroupData>) => api.put<{ group: CommunityGroup }>(`/community/groups/${id}`, data),
  deleteGroup: (id: number) => api.delete(`/community/groups/${id}`),
  joinGroup: (id: number) => api.post(`/community/groups/${id}/join`),
  joinByInviteLink: (inviteLink: string) => api.post(`/community/groups/join/${inviteLink}`),
  leaveGroup: (id: number) => api.post(`/community/groups/${id}/leave`),
  searchGroups: (query: string) => api.get<{ groups: CommunityGroup[] }>(`/community/groups/search?q=${encodeURIComponent(query)}`),

  // Admin - Groups
  adminGetAllGroups: () => api.get<{ groups: CommunityGroup[] }>('/community/admin/groups'),
  adminToggleGroupActive: (id: number, isActive: boolean) => api.patch<{ group: CommunityGroup }>(`/community/groups/${id}/activate`, { isActive }),

  // Admin - Members
  adminGetAllMembers: (groupId?: number) => {
    const url = groupId ? `/community/admin/members?groupId=${groupId}` : '/community/admin/members';
    return api.get<{ members: any[] }>(url);
  },
  adminBanUserFromGroup: (groupId: number, userId: number) => api.delete(`/community/admin/groups/${groupId}/ban/${userId}`),
  adminUnbanUserFromGroup: (groupId: number, userId: number) => api.delete(`/community/admin/groups/${groupId}/unban/${userId}`),

  // Admin - Stats
  adminGetStats: () => api.get<{ stats: any }>('/community/admin/stats'),

  // Users to add (search non-members)
  getGroupUsers: (groupId: number, query?: string) => 
    api.get<{ users: CommunityUser[] }>(`/community/groups/${groupId}/users?q=${encodeURIComponent(query || '')}`),

  // Members
  addMember: (groupId: number, data: AddMemberData) => 
    api.post<{ member: CommunityMember }>(`/community/groups/${groupId}/members`, data),
  removeMember: (groupId: number, userId: number) => 
    api.delete(`/community/groups/${groupId}/members/${userId}`),
  updateMemberRole: (groupId: number, userId: number, role: string) => 
    api.put(`/community/groups/${groupId}/members/${userId}`, { role }),

  // Invite links
  getInviteLink: (groupId: number) => 
    api.get<{ inviteLink: string }>(`/community/groups/${groupId}/invite`),
  generateInviteLink: (groupId: number) => 
    api.post<{ inviteLink: string }>(`/community/groups/${groupId}/invite`),

  // Messages
  getGroupMessages: (groupId: number, limit?: number, before?: string) => 
    api.get<{ messages: CommunityMessage[] }>(`/community/groups/${groupId}/messages?limit=${limit || 50}${before ? `&before=${before}` : ''}`),
  sendMessage: (groupId: number, data: MessagePayload) => 
    api.post<{ message: CommunityMessage }>(`/community/groups/${groupId}/messages`, data),
  editMessage: (groupId: number, messageId: number, content: string) => 
    api.put(`/community/groups/${groupId}/messages/${messageId}`, { content }),
  deleteMessage: (groupId: number, messageId: number) => 
    api.delete(`/community/groups/${groupId}/messages/${messageId}`),
  pinMessage: (groupId: number, messageId: number) => 
    api.post(`/community/groups/${groupId}/messages/${messageId}/pin`),
  reactToMessage: (groupId: number, messageId: number, emoji: string) => 
    api.post(`/community/groups/${groupId}/messages/${messageId}/react`, { emoji }),
};