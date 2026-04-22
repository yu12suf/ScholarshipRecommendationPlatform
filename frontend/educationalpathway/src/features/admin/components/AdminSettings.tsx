'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette,
  Database,
  Mail,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Building,
  Clock,
  DollarSign,
  BookOpen,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getSettings, updateSettings, AdminSettings as AdminSettingsType } from '@/features/admin/api/admin-api';

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'platform' | 'appearance'>('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [generalSettings, setGeneralSettings] = useState<AdminSettingsType['general']>({
    platformName: 'EduPath Scholarship Platform',
    supportEmail: 'support@edupath.com',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false,
  });

  const [notificationSettings, setNotificationSettings] = useState<AdminSettingsType['notifications']>({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReports: true,
    securityAlerts: true,
    newUserAlerts: false,
  });

  const [platformSettings, setPlatformSettings] = useState<AdminSettingsType['platform']>({
    maxScholarships: 1000,
    maxCounselors: 500,
    sessionTimeout: 30,
    requireVerification: true,
    allowPublicRegistration: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        setGeneralSettings(data.general);
        setNotificationSettings(data.notifications);
        setPlatformSettings(data.platform);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        general: generalSettings,
        notifications: notificationSettings,
        platform: platformSettings,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'platform', label: 'Platform', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-muted/30 -z-10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10" />

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
                  <Settings className="h-5 w-5 text-primary-foreground" />
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
                Settings
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-body text-muted-foreground"
              >
                Configure platform settings, notifications, and preferences
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:w-64 shrink-0"
          >
            <Card className="lg:sticky lg:top-8">
              <CardContent className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex-1"
          >
            {activeTab === 'general' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Platform Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Platform Name</label>
                      <input
                        type="text"
                        value={generalSettings.platformName}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Support Email</label>
                      <input
                        type="email"
                        value={generalSettings.supportEmail}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                        className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Timezone</label>
                        <select
                          value={generalSettings.timezone}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                          className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="UTC">UTC</option>
                          <option value="EST">EST (UTC-5)</option>
                          <option value="PST">PST (UTC-8)</option>
                          <option value="GMT">GMT (UTC+0)</option>
                          <option value="CET">CET (UTC+1)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Language</label>
                        <select
                          value={generalSettings.language}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                          className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Maintenance Mode</p>
                        <p className="text-xs text-muted-foreground">Disable access for non-admin users</p>
                      </div>
                      <button
                        onClick={() => setGeneralSettings({ ...generalSettings, maintenanceMode: !generalSettings.maintenanceMode })}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          generalSettings.maintenanceMode ? 'bg-warning' : 'bg-muted'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          generalSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important alerts via email' },
                      { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                      { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Summary of platform activity' },
                      { key: 'securityAlerts', label: 'Security Alerts', desc: 'Login attempts and security events' },
                      { key: 'newUserAlerts', label: 'New User Alerts', desc: 'Notifications for new registrations' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotificationSettings({ 
                            ...notificationSettings, 
                            [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings] 
                          })}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            notificationSettings[item.key as keyof typeof notificationSettings] ? 'bg-success' : 'bg-muted'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            notificationSettings[item.key as keyof typeof notificationSettings] ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'platform' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Platform Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Max Scholarships</label>
                        <div className="relative">
                          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="number"
                            value={platformSettings.maxScholarships}
                            onChange={(e) => setPlatformSettings({ ...platformSettings, maxScholarships: parseInt(e.target.value) })}
                            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Max Counselors</label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="number"
                            value={platformSettings.maxCounselors}
                            onChange={(e) => setPlatformSettings({ ...platformSettings, maxCounselors: parseInt(e.target.value) })}
                            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Session Timeout (minutes)</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="number"
                            value={platformSettings.sessionTimeout}
                            onChange={(e) => setPlatformSettings({ ...platformSettings, sessionTimeout: parseInt(e.target.value) })}
                            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Require Counselor Verification</p>
                        <p className="text-xs text-muted-foreground">Counselors must be verified before accessing</p>
                      </div>
                      <button
                        onClick={() => setPlatformSettings({ ...platformSettings, requireVerification: !platformSettings.requireVerification })}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          platformSettings.requireVerification ? 'bg-success' : 'bg-muted'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          platformSettings.requireVerification ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Allow Public Registration</p>
                        <p className="text-xs text-muted-foreground">Users can register without invitation</p>
                      </div>
                      <button
                        onClick={() => setPlatformSettings({ ...platformSettings, allowPublicRegistration: !platformSettings.allowPublicRegistration })}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          platformSettings.allowPublicRegistration ? 'bg-success' : 'bg-muted'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          platformSettings.allowPublicRegistration ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Theme & Branding
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-3 block">Theme Mode</label>
                      <div className="flex gap-4">
                        <button className="flex-1 p-4 border-2 border-primary rounded-lg bg-muted/30">
                          <div className="w-full h-20 bg-background border rounded mb-2" />
                          <p className="text-sm font-medium">Light</p>
                        </button>
                        <button className="flex-1 p-4 border border-border rounded-lg hover:border-primary/50">
                          <div className="w-full h-20 bg-slate-900 border rounded mb-2" />
                          <p className="text-sm font-medium">Dark</p>
                        </button>
                        <button className="flex-1 p-4 border border-border rounded-lg hover:border-primary/50">
                          <div className="w-full h-20 bg-gradient-to-b from-background to-slate-900 border rounded mb-2" />
                          <p className="text-sm font-medium">System</p>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Primary Color</label>
                      <div className="flex gap-3">
                        {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                          <button
                            key={color}
                            className={`w-10 h-10 rounded-full border-2 ${color === '#10b981' ? 'border-foreground' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};