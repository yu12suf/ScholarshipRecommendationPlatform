import api from '@/lib/api';
import { User, UserRole } from '@/features/auth/types';

export interface AdminStats {
  totalUsers: number;
  students: number;
  counselors: number;
  admins: number;
}

export interface PlatformStats {
  overview: {
    totalUsers: number;
    students: number;
    counselors: number;
    activeSessions: number;
  };
  trends: {
    users: number;
    students: number;
    counselors: number;
  };
  engagement: {
    profileCompletions: number;
    scholarshipSearches: number;
    applications: number;
    counselorChats: number;
    assessmentCompletions: number;
  };
  scholarships: {
    total: number;
    totalFunding: number;
  };
  bookings: {
    total: number;
    scheduled: number;
  };
}

export interface SystemLog {
  id: number;
  timestamp: Date;
  level: string;
  category: string;
  message: string;
  user?: string;
  ip?: string;
  details?: string;
}

export interface SecurityInfo {
  summary: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    newUsersLast7Days: number;
    failedLogins24h: number;
    activeSessions: number;
    blockedIPs: number;
  };
  securityScore: number;
  securityStatus: string;
  lastScan: Date;
  recommendations: string[];
  features: Array<{
    name: string;
    enabled: boolean;
    description: string;
  }>;
  events: Array<{
    id: number;
    type: string;
    status: string;
    timestamp: Date;
    ip: string;
    location: string;
    device: string;
  }>;
  apiKeys: Array<{
    id: string;
    name: string;
    key: string;
    status: string;
    createdAt: Date;
    lastUsed: Date;
  }>;
}

export interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: Date;
  attempts: number;
}

export interface AdminSettings {
  general: {
    platformName: string;
    supportEmail: string;
    timezone: string;
    language: string;
    maintenanceMode: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
    securityAlerts: boolean;
    newUserAlerts: boolean;
  };
  platform: {
    maxScholarships: number;
    maxCounselors: number;
    sessionTimeout: number;
    requireVerification: boolean;
    allowPublicRegistration: boolean;
  };
}

export const getAllUsers = async (page = 1, limit = 10): Promise<User[]> => {
  const response = await api.get('/user', { params: { page, limit } });
  return response.data;
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get('/user/stats');
  return response.data;
};

export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  const response = await api.get(`/user/role/${role}`);
  return response.data;
};

export const getBookedStudents = async (): Promise<User[]> => {
  const response = await api.get('/user/booked-students');
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get(`/user/${id}`);
  return response.data;
};

export const updateUserRole = async (id: number, role: UserRole): Promise<User> => {
  const response = await api.put(`/user/${id}/role`, { role });
  return response.data;
};

export const deactivateUser = async (id: number): Promise<void> => {
  await api.put(`/user/${id}/deactivate`);
};

export const activateUser = async (id: number): Promise<void> => {
  await api.put(`/user/${id}/activate`);
};

export const getAllCounselors = async (): Promise<any[]> => {
  const response = await api.get('/counselors/admin/list');
  return response.data || [];
};

export const updateCounselorVerification = async (id: number, status: 'verified' | 'rejected'): Promise<void> => {
  await api.patch(`/counselors/admin/${id}/verification`, { verificationStatus: status });
};

export const getPlatformStats = async (period = '30d'): Promise<PlatformStats> => {
  const response = await api.get('/admin/platform-stats', { params: { period } });
  return response.data;
};

export const getEngagementMetrics = async (period = '30d'): Promise<any> => {
  const response = await api.get('/admin/platform-stats/engagement', { params: { period } });
  return response.data;
};

export const getSystemLogs = async (filters: {
  level?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<{ logs: SystemLog[]; total: number; page: number; limit: number }> => {
  const response = await api.get('/admin/system-logs', { params: filters });
  return response.data;
};

export const getSecurityCenter = async (): Promise<SecurityInfo> => {
  const response = await api.get('/admin/security-center');
  return response.data;
};

export const getSecurityEvents = async (limit = 20): Promise<any[]> => {
  const response = await api.get('/admin/security-center/events', { params: { limit } });
  return response.data;
};

export const getBlockedIPs = async (): Promise<BlockedIP[]> => {
  const response = await api.get('/admin/security-center/blocked-ips');
  return response.data;
};

export const blockIP = async (ip: string, reason: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/admin/security-center/block-ip', { ip, reason });
  return response.data;
};

export const unblockIP = async (ip: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/admin/security-center/blocked-ips/${ip}`);
  return response.data;
};

export const getSettings = async (): Promise<AdminSettings> => {
  const response = await api.get('/admin/settings');
  return response.data;
};

export const updateSettings = async (settings: Partial<AdminSettings>): Promise<{ success: boolean; settings: AdminSettings }> => {
  const response = await api.put('/admin/settings', settings);
  return response.data;
};
