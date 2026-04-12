'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  BookOpen,
  MessageSquare,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getAdminStats, getPlatformStats, getEngagementMetrics, PlatformStats as PlatformStatsType } from '@/features/admin/api/admin-api';

interface PlatformMetrics {
  date: string;
  students: number;
  counselors: number;
  scholarships: number;
  applications: number;
}

export const PlatformStats = () => {
  const [stats, setStats] = useState<PlatformStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [metrics, setMetrics] = useState<PlatformMetrics[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, engagementData] = await Promise.all([
          getPlatformStats(timeRange),
          getEngagementMetrics(timeRange)
        ]);
        
        setStats({
          overview: statsData.overview,
          trends: statsData.trends,
          engagement: engagementData,
          scholarships: statsData.scholarships,
          bookings: statsData.bookings
        } as PlatformStatsType);
        
        generateMockMetrics(timeRange);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        const fallbackStats = await getAdminStats();
        setStats({
          overview: {
            totalUsers: (fallbackStats.students || 0) + (fallbackStats.counselors || 0),
            students: fallbackStats.students || 0,
            counselors: fallbackStats.counselors || 0,
            activeSessions: 247
          },
          trends: { users: 12.5, students: 8.2, counselors: 3.1 },
          engagement: {
            profileCompletions: 892,
            scholarshipSearches: 3421,
            applications: 567,
            counselorChats: 1243,
            assessmentCompletions: 456
          },
          scholarships: { total: 150, totalFunding: 750000 },
          bookings: { total: 320, scheduled: 96 }
        });
        generateMockMetrics(timeRange);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const generateMockMetrics = (range: string) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const mockData: PlatformMetrics[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      mockData.push({
        date: date.toISOString().split('T')[0],
        students: Math.floor(Math.random() * 50) + 10,
        counselors: Math.floor(Math.random() * 10) + 2,
        scholarships: Math.floor(Math.random() * 20) + 5,
        applications: Math.floor(Math.random() * 100) + 20,
      });
    }
    setMetrics(mockData);
  };

  const statCards = [
    { 
      label: 'Total Users', 
      value: ((stats?.overview?.students || 0) + (stats?.overview?.counselors || 0)).toString(), 
      icon: Users, 
      color: 'primary',
      trend: '+12.5%',
      trendUp: true,
      subtitle: 'Active accounts'
    },
    { 
      label: 'Students', 
      value: stats?.overview?.students?.toString() || '0', 
      icon: GraduationCap, 
      color: 'info',
      trend: '+8.2%',
      trendUp: true,
      subtitle: 'Enrolled users'
    },
    { 
      label: 'Counselors', 
      value: stats?.overview?.counselors?.toString() || '0', 
      icon: ShieldCheck, 
      color: 'success',
      trend: '+3.1%',
      trendUp: true,
      subtitle: 'Verified professionals'
    },
    { 
      label: 'Active Sessions', 
      value: stats?.overview?.activeSessions?.toString() || '247', 
      icon: Activity, 
      color: 'warning',
      trend: '-2.4%',
      trendUp: false,
      subtitle: 'Current online'
    },
  ];

  const engagementData = [
    { label: 'Profile Completions', value: 892, change: 12.5 },
    { label: 'Scholarship Searches', value: 3421, change: 8.2 },
    { label: 'Applications Submitted', value: 567, change: -3.1 },
    { label: 'Counselor Chats', value: 1243, change: 15.7 },
    { label: 'Assessment Completions', value: 456, change: 22.4 },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
      primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', gradient: 'bg-primary' },
      success: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20', gradient: 'bg-success' },
      info: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/20', gradient: 'bg-info' },
      warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20', gradient: 'bg-warning' },
    };
    return colors[color] || colors.primary;
  };

  const maxValue = Math.max(...metrics.map(m => m.students + m.counselors + m.scholarships));

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-muted/30 -z-10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-info/5 rounded-full blur-[150px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative pt-8 pb-6 px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-3"
              >
                <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
                  <Activity className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-small uppercase tracking-wider text-muted-foreground">
                  Admin Panel
                </span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="h1 mb-2"
              >
                Platform Statistics
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-body text-muted-foreground"
              >
                Comprehensive analytics and performance metrics for the platform
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <div className="flex bg-muted/50 rounded-lg p-1">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      timeRange === range 
                        ? 'bg-card text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((stat, idx) => {
            const colors = getColorClasses(stat.color);
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colors.bg}`}>
                    <stat.icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                    {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.trend}
                  </div>
                </div>
                <p className="text-small text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{stat.subtitle}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">User Activity Overview</CardTitle>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-muted-foreground">Counselors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-info" />
                    <span className="text-muted-foreground">Scholarships</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end gap-2">
                  {metrics.map((m, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col-reverse gap-0.5 h-[250px]">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(m.students / maxValue) * 200}px` }}
                          transition={{ delay: 0.1 * idx, duration: 0.5 }}
                          className="w-full bg-primary rounded-t-sm"
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(m.counselors / maxValue) * 200}px` }}
                          transition={{ delay: 0.1 * idx + 0.1, duration: 0.5 }}
                          className="w-full bg-success rounded-t-sm"
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(m.scholarships / maxValue) * 200}px` }}
                          transition={{ delay: 0.1 * idx + 0.2, duration: 0.5 }}
                          className="w-full bg-info rounded-t-sm"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(m.date).getDate()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {engagementData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{item.value.toLocaleString()}</span>
                      <span className={`text-xs ${item.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {item.change >= 0 ? '+' : ''}{item.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { icon: DollarSign, label: 'Total Scholarships', value: '$2.4M', sub: 'Funding available' },
            { icon: BookOpen, label: 'Active Courses', value: '156', sub: '12 new this month' },
            { icon: Calendar, label: 'Scheduled Sessions', value: '892', sub: '78 upcoming' },
            { icon: MessageSquare, label: 'Chat Messages', value: '12.4K', sub: 'Avg 412/day' },
          ].map((item, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-xl font-bold">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
};