'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Lock, 
  Key, 
  Eye, 
  EyeOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Globe,
  Server,
  Fingerprint,
  Mail,
  LogOut,
  TrendingUp,
  Activity,
  Ban,
  Unlock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getSecurityCenter, getBlockedIPs, getSecurityEvents, blockIP, unblockIP, SecurityInfo, BlockedIP as BlockedIPType } from '@/features/admin/api/admin-api';

interface SecurityEvent {
  id: number;
  type: 'login' | 'logout' | 'failed' | 'password_change' | 'mfa' | 'blocked';
  status: 'success' | 'failed' | 'pending';
  timestamp: Date;
  ip: string;
  location: string;
  device: string;
}

export const SecurityCenter = () => {
  const [securityData, setSecurityData] = useState<SecurityInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'access' | 'blocked'>('overview');
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIPType[]>([]);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurityData = async () => {
      setLoading(true);
      try {
        const [securityInfo, blockedIPsData, eventsData] = await Promise.all([
          getSecurityCenter(),
          getBlockedIPs(),
          getSecurityEvents(20)
        ]);
        setSecurityData(securityInfo);
        setBlockedIPs(blockedIPsData);
        setRecentEvents(eventsData as SecurityEvent[]);
      } catch (error) {
        console.error('Failed to fetch security data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSecurityData();
  }, []);

  const securityScore = securityData?.securityScore || 0;

  const securityFeatures = securityData?.features || [
    { 
      name: 'Two-Factor Authentication', 
      enabled: true, 
      description: 'Add an extra layer of security to your account'
    },
    { 
      name: 'IP Whitelisting', 
      enabled: true, 
      description: 'Restrict access to specific IP addresses'
    },
    { 
      name: 'Session Timeout', 
      enabled: true, 
      description: 'Auto logout after 30 minutes of inactivity'
    },
    { 
      name: 'Login Alerts', 
      enabled: true, 
      description: 'Get notified of new device logins'
    },
  ];

  const securityMetrics = [
    { label: 'Failed Logins (24h)', value: securityData?.summary?.failedLogins24h?.toString() || '12', trend: '-23%', good: true },
    { label: 'Active Sessions', value: securityData?.summary?.activeSessions?.toString() || '47', trend: '+5%', good: true },
    { label: 'Blocked IPs', value: blockedIPs.length.toString(), trend: '0%', good: true },
    { label: 'Security Score', value: `${securityScore}%`, trend: '+2%', good: true },
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <LogOut className="h-4 w-4" />;
      case 'logout': return <Unlock className="h-4 w-4" />;
      case 'failed': return <ShieldAlert className="h-4 w-4" />;
      case 'password_change': return <Key className="h-4 w-4" />;
      case 'mfa': return <Fingerprint className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-success bg-success/10';
      case 'failed': return 'text-destructive bg-destructive/10';
      default: return 'text-warning bg-warning/10';
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-muted/30 -z-10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-destructive/5 rounded-full blur-[150px] -z-10" />

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
                  <Shield className="h-5 w-5 text-primary-foreground" />
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
                Security Center
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-body text-muted-foreground"
              >
                Monitor security status, manage access controls, and view threat analytics
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Run Security Scan
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
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Security Score</p>
                    <p className="text-4xl font-bold">{securityScore}%</p>
                  </div>
                  <div className={`p-4 rounded-full ${securityScore >= 80 ? 'bg-success/10' : 'bg-warning/10'}`}>
                    {securityScore >= 80 ? (
                      <ShieldCheck className="h-8 w-8 text-success" />
                    ) : (
                      <ShieldAlert className="h-8 w-8 text-warning" />
                    )}
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${securityScore}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-3 rounded-full ${securityScore >= 80 ? 'bg-success' : 'bg-warning'}`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {securityScore >= 80 ? 'Your security is in good standing' : 'Some improvements recommended'}
                </p>
              </CardContent>
            </Card>
          </div>

          {securityMetrics.map((metric, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  </div>
                  <div className={`text-xs font-medium ${metric.good ? 'text-success' : 'text-destructive'}`}>
                    {metric.trend}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex border-b border-border">
            {(['overview', 'access', 'blocked'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${feature.enabled ? 'bg-success/10' : 'bg-muted'}`}>
                        <ShieldCheck className={`h-4 w-4 ${feature.enabled ? 'text-success' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{feature.name}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <button
                      className={`w-12 h-6 rounded-full transition-colors ${
                        feature.enabled ? 'bg-success' : 'bg-muted'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        feature.enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentEvents.slice(0, 8).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {getEventIcon(event.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">{event.type.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground">{event.device} • {event.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'access' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">API Keys & Access Tokens</CardTitle>
                <Button size="sm">
                  <Key className="h-4 w-4 mr-2" />
                  Generate New Key
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Production API Key</span>
                    <span className="text-xs text-success bg-success/10 px-2 py-1 rounded">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-muted p-2 rounded">
                      {showApiKey ? 'sk_live_abc123xyz789def456ghi' : 'sk_live_••••••••••••••••••••'}
                    </code>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-2 hover:bg-muted rounded"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button className="p-2 hover:bg-muted rounded">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Created: Jan 15, 2026 • Last used: Today</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Development API Key</span>
                    <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded">Inactive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-muted p-2 rounded">
                      sk_test_••••••••••••••••••••
                    </code>
                    <button className="p-2 hover:bg-muted rounded">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded">
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Created: Dec 1, 2025 • Last used: 3 days ago</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'blocked' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Blocked IP Addresses</CardTitle>
                <Button variant="outline" size="sm">
                  <Ban className="h-4 w-4 mr-2" />
                  Block New IP
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {blockedIPs.map((blocked, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-destructive/10">
                          <Ban className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                          <p className="text-sm font-mono font-medium">{blocked.ip}</p>
                          <p className="text-xs text-muted-foreground">{blocked.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Attempts: {blocked.attempts}</p>
                          <p className="text-xs text-muted-foreground">
                            Blocked: {new Date(blocked.blockedAt).toLocaleString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Unlock className="h-4 w-4 mr-2" />
                          Unblock
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};