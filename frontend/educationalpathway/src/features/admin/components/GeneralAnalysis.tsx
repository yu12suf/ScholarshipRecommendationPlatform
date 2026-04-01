'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Activity, 
  Zap, 
  GraduationCap, 
  ShieldCheck, 
  Settings,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { getAdminStats, AdminStats } from '../api/admin-api';

export const GeneralAnalysis = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statsConfig = [
    { 
      label: 'Total Users', 
      value: ((stats?.students || 0) + (stats?.counselors || 0)).toString(), 
      icon: Users, 
      color: 'primary',
      trend: '+12% this month',
      trendUp: true 
    },
    { 
      label: 'Students', 
      value: stats?.students.toString() || '0', 
      icon: GraduationCap, 
      color: 'success',
      trend: '245 new this week',
      trendUp: true
    },
    { 
      label: 'Counselors', 
      value: stats?.counselors.toString() || '0', 
      icon: ShieldCheck, 
      color: 'info',
      trend: '32 pending verification',
      trendUp: false
    },
    { 
      label: 'System Health', 
      value: '98.9%', 
      icon: Activity, 
      color: 'warning',
      trend: 'Optimal performance',
      trendUp: true
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      primary: {
        bg: 'bg-primary/10',
        text: 'text-primary',
        border: 'border-primary/20',
        gradient: 'primary-gradient'
      },
      success: {
        bg: 'bg-success/10',
        text: 'text-success',
        border: 'border-success/20',
        gradient: 'bg-success'
      },
      info: {
        bg: 'bg-info/10',
        text: 'text-info',
        border: 'border-info/20',
        gradient: 'bg-info'
      },
      warning: {
        bg: 'bg-warning/10',
        text: 'text-warning',
        border: 'border-warning/20',
        gradient: 'bg-warning'
      }
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-muted/50 -z-10" />
      
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-info/5 rounded-full blur-[120px] -z-10" />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative pt-12 pb-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="p-2 primary-gradient rounded-lg shadow-primary/20">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-small uppercase tracking-wider">
                  Admin Dashboard
                </span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="h1 mb-4"
              >
                System Overview
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-body max-w-2xl"
              >
                Monitor platform performance, user activity, and system health metrics in real-time.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3"
            >
              <Button className="primary-gradient text-primary-foreground font-semibold px-6 py-3 rounded-lg shadow-primary/25 transition-all duration-200 hover:scale-105">
                <Settings className="h-5 w-5 mr-2" />
                Configuration
              </Button>
              <Button variant="outline" className="border-border hover:border-primary/50 text-foreground font-semibold px-6 py-3 rounded-lg bg-card/80 backdrop-blur-sm transition-all duration-200">
                <Zap className="h-5 w-5 mr-2" />
                Quick Actions
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsConfig.map((stat, idx) => {
            const colors = getColorClasses(stat.color);
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative bg-card rounded-lg border border-border overflow-hidden hover: transition-all duration-300"
              >
                {/* Gradient Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${colors.gradient}`} />
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colors.bg}`}>
                      <stat.icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    
                    <span className="flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                      <TrendingUp className="h-3 w-3" />
                      Live
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-small">{stat.label}</p>
                    <p className="text-3xl font-bold text-card-foreground">{stat.value}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">{stat.trend}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
