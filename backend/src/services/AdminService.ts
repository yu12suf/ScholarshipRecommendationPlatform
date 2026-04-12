import { User, Booking, Notification, Scholarship, Counselor, Student, AssessmentResult } from '../models/index.js';
import { Op } from 'sequelize';

interface PlatformStatsResult {
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

interface SystemLogsResult {
  logs: Array<{
    id: number;
    timestamp: Date;
    level: string;
    category: string;
    message: string;
    user?: string;
    ip?: string;
    details?: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

interface SecurityInfo {
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

interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: Date;
  attempts: number;
}

interface AdminSettings {
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

const blockedIPs: BlockedIP[] = [];

export class AdminService {
  static async getPlatformStats(period: string): Promise<PlatformStatsResult> {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalUsers,
      students,
      counselors,
      totalScholarships,
      totalBookings,
      newStudents,
      newCounselors,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'student' } }),
      User.count({ where: { role: 'counselor' } }),
      Scholarship.count(),
      Booking.count(),
      User.count({ where: { role: 'student', createdAt: { [Op.gte]: startDate } } }),
      User.count({ where: { role: 'counselor', createdAt: { [Op.gte]: startDate } } }),
    ]);

    const mockEngagement = {
      profileCompletions: Math.floor(Math.random() * 500) + 500,
      scholarshipSearches: Math.floor(Math.random() * 2000) + 2000,
      applications: Math.floor(Math.random() * 300) + 300,
      counselorChats: Math.floor(Math.random() * 800) + 800,
      assessmentCompletions: Math.floor(Math.random() * 200) + 200,
    };

    return {
      overview: {
        totalUsers,
        students,
        counselors,
        activeSessions: Math.floor(Math.random() * 200) + 100,
      },
      trends: {
        users: Math.round((newStudents + newCounselors) / days * 30 * 100) / 100,
        students: Math.round(newStudents / days * 30 * 100) / 100,
        counselors: Math.round(newCounselors / days * 30 * 100) / 100,
      },
      engagement: mockEngagement,
      scholarships: {
        total: totalScholarships,
        totalFunding: totalScholarships * 5000,
      },
      bookings: {
        total: totalBookings,
        scheduled: Math.floor(totalBookings * 0.3),
      },
    };
  }

  static async getSystemLogs(filters: {
    level?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
  }): Promise<SystemLogsResult> {
    const { level, category, startDate, endDate, page, limit } = filters;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (level && level !== 'all') {
      where.level = level;
    }
    if (category && category !== 'all') {
      where.category = category;
    }

    const logs = [];
    const categories = ['Auth', 'API', 'Database', 'Security', 'Payment', 'Email', 'Scheduler'];
    const levels = ['info', 'warning', 'error', 'success'];
    const messages = {
      info: ['User login successful', 'API request processed', 'Database query executed', 'Session created', 'Cache refreshed', 'Email sent successfully', 'Background job completed'],
      warning: ['High memory usage detected', 'Rate limit approaching', 'Deprecated API endpoint called', 'Slow query detected', 'Certificate expiring soon'],
      error: ['Connection timeout', 'Authentication failed', 'Database connection error', 'Payment processing failed', 'Email delivery failed'],
      success: ['User registration completed', 'Scholarship application approved', 'Verification completed', 'Backup completed successfully'],
    };
    const users = ['admin', 'john.doe@email.com', 'counselor1', 'student456', 'system'];

    const totalLogs = 150;
    for (let i = 0; i < Math.min(limit, totalLogs); i++) {
      const logLevel = levels[Math.floor(Math.random() * levels.length)];
      const logCategory = categories[Math.floor(Math.random() * categories.length)];
      
      if (level && level !== 'all' && logLevel !== level) continue;
      if (category && category !== 'all' && logCategory !== category) continue;

      logs.push({
        id: i + 1 + offset,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        level: logLevel,
        category: logCategory,
        message: messages[logLevel as keyof typeof messages][Math.floor(Math.random() * messages[logLevel as keyof typeof messages].length)],
        user: users[Math.floor(Math.random() * users.length)],
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        details: logLevel === 'error' || logLevel === 'warning' ? `Stack trace: Error at line ${Math.floor(Math.random() * 1000)}` : undefined,
      });
    }

    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      logs,
      total: totalLogs,
      page,
      limit,
    };
  }

  static async getSecurityInfo(): Promise<SecurityInfo> {
    const [totalUsers, activeUsers, newUsersLast7Days] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      User.count({
        where: {
          createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const mockEvents = [];
    const eventTypes = ['login', 'logout', 'failed', 'password_change', 'mfa', 'blocked'];
    const statuses = ['success', 'failed', 'pending'];
    const devices = ['Chrome / Windows', 'Safari / macOS', 'Firefox / Linux', 'Mobile App / iOS'];
    const locations = ['New York, US', 'London, UK', 'Berlin, DE', 'Tokyo, JP', 'Singapore'];

    for (let i = 0; i < 20; i++) {
      mockEvents.push({
        id: i + 1,
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
      });
    }

    return {
      summary: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        newUsersLast7Days,
        failedLogins24h: Math.floor(Math.random() * 20),
        activeSessions: Math.floor(Math.random() * 50) + 20,
        blockedIPs: blockedIPs.length,
      },
      securityScore: 87,
      securityStatus: 'healthy',
      lastScan: new Date(),
      recommendations: [
        'Enable two-factor authentication for all admin accounts',
        'Review user activity logs regularly',
        'Keep system software updated',
        'Consider implementing IP whitelisting',
      ],
      features: [
        { name: 'Two-Factor Authentication', enabled: true, description: 'Add an extra layer of security to your account' },
        { name: 'IP Whitelisting', enabled: true, description: 'Restrict access to specific IP addresses' },
        { name: 'Session Timeout', enabled: true, description: 'Auto logout after 30 minutes of inactivity' },
        { name: 'Login Alerts', enabled: true, description: 'Get notified of new device logins' },
      ],
      events: mockEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      apiKeys: [
        { id: '1', name: 'Production API Key', key: 'sk_live_abc123xyz789def456ghi', status: 'Active', createdAt: new Date('2026-01-15'), lastUsed: new Date() },
        { id: '2', name: 'Development API Key', key: 'sk_test_xyz789def456abc123', status: 'Inactive', createdAt: new Date('2025-12-01'), lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      ],
    };
  }

  static async getBlockedIPs(): Promise<BlockedIP[]> {
    return blockedIPs;
  }

  static async blockIP(ip: string, reason: string): Promise<{ success: boolean; message: string }> {
    const existing = blockedIPs.find((b) => b.ip === ip);
    if (existing) {
      return { success: false, message: 'IP already blocked' };
    }
    blockedIPs.push({
      ip,
      reason,
      blockedAt: new Date(),
      attempts: Math.floor(Math.random() * 20) + 5,
    });
    return { success: true, message: 'IP blocked successfully' };
  }

  static async unblockIP(ip: string): Promise<{ success: boolean; message: string }> {
    const index = blockedIPs.findIndex((b) => b.ip === ip);
    if (index === -1) {
      return { success: false, message: 'IP not found in blocked list' };
    }
    blockedIPs.splice(index, 1);
    return { success: true, message: 'IP unblocked successfully' };
  }

  static async getSettings(): Promise<AdminSettings> {
    return {
      general: {
        platformName: 'EduPath Scholarship Platform',
        supportEmail: 'support@edupath.com',
        timezone: 'UTC',
        language: 'en',
        maintenanceMode: false,
      },
      notifications: {
        emailAlerts: true,
        pushNotifications: true,
        weeklyReports: true,
        securityAlerts: true,
        newUserAlerts: false,
      },
      platform: {
        maxScholarships: 1000,
        maxCounselors: 500,
        sessionTimeout: 30,
        requireVerification: true,
        allowPublicRegistration: true,
      },
    };
  }

  static async updateSettings(settings: Partial<AdminSettings>): Promise<{ success: boolean; settings: AdminSettings }> {
    const currentSettings = await this.getSettings();
    const updatedSettings = {
      general: { ...currentSettings.general, ...settings.general },
      notifications: { ...currentSettings.notifications, ...settings.notifications },
      platform: { ...currentSettings.platform, ...settings.platform },
    };
    return { success: true, settings: updatedSettings };
  }

  static async getSecurityEvents(limit: number) {
    const eventTypes = ['login', 'logout', 'failed', 'password_change', 'mfa', 'blocked'];
    const statuses = ['success', 'failed', 'pending'];
    const devices = ['Chrome / Windows', 'Safari / macOS', 'Firefox / Linux', 'Mobile App / iOS'];
    const locations = ['New York, US', 'London, UK', 'Berlin, DE', 'Tokyo, JP', 'Singapore'];

    const events = [];
    for (let i = 0; i < limit; i++) {
      events.push({
        id: i + 1,
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        location: locations[Math.floor(Math.random() * locations.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
      });
    }
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  static async getEngagementMetrics(period: string) {
    return {
      profileCompletions: Math.floor(Math.random() * 500) + 500,
      scholarshipSearches: Math.floor(Math.random() * 2000) + 2000,
      applications: Math.floor(Math.random() * 300) + 300,
      counselorChats: Math.floor(Math.random() * 800) + 800,
      assessmentCompletions: Math.floor(Math.random() * 200) + 200,
      changes: {
        profileCompletions: 12.5,
        scholarshipSearches: 8.2,
        applications: -3.1,
        counselorChats: 15.7,
        assessmentCompletions: 22.4,
      },
    };
  }
}
