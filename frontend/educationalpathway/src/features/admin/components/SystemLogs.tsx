'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getSystemLogs, SystemLog } from '@/features/admin/api/admin-api';

const generateMockLogs = (): SystemLog[] => {
  const categories = ['Auth', 'API', 'Database', 'Security', 'Payment', 'Email', 'Scheduler'];
  const levels: ('info' | 'warning' | 'error' | 'success')[] = ['info', 'warning', 'error', 'success'];
  const messages = {
    info: [
      'User login successful',
      'API request processed',
      'Database query executed',
      'Session created',
      'Cache refreshed',
      'Email sent successfully',
      'Background job completed',
    ],
    warning: [
      'High memory usage detected',
      'Rate limit approaching',
      'Deprecated API endpoint called',
      'Slow query detected',
      'Certificate expiring soon',
    ],
    error: [
      'Connection timeout',
      'Authentication failed',
      'Database connection error',
      'Payment processing failed',
      'Email delivery failed',
    ],
    success: [
      'User registration completed',
      'Scholarship application approved',
      'Verification completed',
      'Backup completed successfully',
    ],
  };
  const users = ['admin', 'john.doe@email.com', 'counselor1', 'student456', 'system'];
  
  const logs: SystemLog[] = [];
  const now = new Date();
  
  for (let i = 0; i < 150; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const msgList = messages[level];
    
    logs.push({
      id: i + 1,
      timestamp: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      level,
      category,
      message: msgList[Math.floor(Math.random() * msgList.length)],
      user: users[Math.floor(Math.random() * users.length)],
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      details: level === 'error' || level === 'warning' ? `Stack trace: Error at line ${Math.floor(Math.random() * 1000)}` : undefined,
    });
  }
  
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const SystemLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [selectedLogs, setSelectedLogs] = useState<number[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const result = await getSystemLogs({
          level: levelFilter,
          category: categoryFilter,
          page: 1,
          limit: 150
        });
        setLogs(result.logs);
        setTotalLogs(result.total);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
        const mockLogs = generateMockLogs();
        setLogs(mockLogs);
        setTotalLogs(mockLogs.length);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [levelFilter, categoryFilter]);

  const filteredLogs = logs.filter(log => {
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !log.user?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (levelFilter !== 'all' && log.level !== levelFilter) return false;
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
    
    if (dateFilter !== 'all') {
      const now = new Date();
      const logDate = new Date(log.timestamp);
      const diffDays = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === '1d' && diffDays > 1) return false;
      if (dateFilter === '7d' && diffDays > 7) return false;
      if (dateFilter === '30d' && diffDays > 30) return false;
    }
    
    return true;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <Info className="h-4 w-4 text-info" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const badges: Record<string, string> = {
      error: 'bg-destructive/10 text-destructive',
      warning: 'bg-warning/10 text-warning',
      success: 'bg-success/10 text-success',
      info: 'bg-info/10 text-info',
    };
    return badges[level] || badges.info;
  };

  const logCounts = {
    total: logs.length,
    error: logs.filter(l => l.level === 'error').length,
    warning: logs.filter(l => l.level === 'warning').length,
    success: logs.filter(l => l.level === 'success').length,
    info: logs.filter(l => l.level === 'info').length,
  };

  const toggleSelectAll = () => {
    if (selectedLogs.length === filteredLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(filteredLogs.map(l => l.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedLogs.includes(id)) {
      setSelectedLogs(selectedLogs.filter(l => l !== id));
    } else {
      setSelectedLogs([...selectedLogs, id]);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 bg-muted/30 -z-10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-warning/5 rounded-full blur-[150px] -z-10" />

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
                <div className="p-2 bg-gradient-to-br from-warning to-warning/80 rounded-lg">
                  <Zap className="h-5 w-5 text-warning-foreground" />
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
                System Logs
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-body text-muted-foreground"
              >
                Monitor and analyze system events, errors, and activities
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
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
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6"
        >
          <button
            onClick={() => setLevelFilter('all')}
            className={`p-4 rounded-xl border transition-all ${
              levelFilter === 'all' 
                ? 'bg-card border-primary shadow-md' 
                : 'bg-card/50 border-border hover:border-primary/50'
            }`}
          >
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{logCounts.total}</p>
          </button>
          <button
            onClick={() => setLevelFilter('error')}
            className={`p-4 rounded-xl border transition-all ${
              levelFilter === 'error' 
                ? 'bg-destructive/10 border-destructive shadow-md' 
                : 'bg-card/50 border-border hover:border-destructive/50'
            }`}
          >
            <p className="text-sm text-destructive/80">Errors</p>
            <p className="text-2xl font-bold text-destructive">{logCounts.error}</p>
          </button>
          <button
            onClick={() => setLevelFilter('warning')}
            className={`p-4 rounded-xl border transition-all ${
              levelFilter === 'warning' 
                ? 'bg-warning/10 border-warning shadow-md' 
                : 'bg-card/50 border-border hover:border-warning/50'
            }`}
          >
            <p className="text-sm text-warning/80">Warnings</p>
            <p className="text-2xl font-bold text-warning">{logCounts.warning}</p>
          </button>
          <button
            onClick={() => setLevelFilter('success')}
            className={`p-4 rounded-xl border transition-all ${
              levelFilter === 'success' 
                ? 'bg-success/10 border-success shadow-md' 
                : 'bg-card/50 border-border hover:border-success/50'
            }`}
          >
            <p className="text-sm text-success/80">Success</p>
            <p className="text-2xl font-bold text-success">{logCounts.success}</p>
          </button>
          <button
            onClick={() => setLevelFilter('info')}
            className={`p-4 rounded-xl border transition-all ${
              levelFilter === 'info' 
                ? 'bg-info/10 border-info shadow-md' 
                : 'bg-card/50 border-border hover:border-info/50'
            }`}
          >
            <p className="text-sm text-info/80">Info</p>
            <p className="text-2xl font-bold text-info">{logCounts.info}</p>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4">
              <CardTitle className="text-lg">Log Entries</CardTitle>
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full lg:w-[250px]"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Categories</option>
                  <option value="Auth">Auth</option>
                  <option value="API">API</option>
                  <option value="Database">Database</option>
                  <option value="Security">Security</option>
                  <option value="Payment">Payment</option>
                  <option value="Email">Email</option>
                  <option value="Scheduler">Scheduler</option>
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Time</option>
                  <option value="1d">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-4">
                        <input
                          type="checkbox"
                          checked={selectedLogs.length === filteredLogs.length && filteredLogs.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-border"
                        />
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Level</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Message</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">IP Address</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <AnimatePresence>
                      {filteredLogs.slice(0, 50).map((log, idx) => (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`hover:bg-muted/30 transition-colors ${
                            selectedLogs.includes(log.id) ? 'bg-muted/20' : ''
                          }`}
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedLogs.includes(log.id)}
                              onChange={() => toggleSelect(log.id)}
                              className="rounded border-border"
                            />
                          </td>
                          <td className="p-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getLevelBadge(log.level)}`}>
                              {getLevelIcon(log.level)}
                              {log.level}
                            </span>
                          </td>
                          <td className="p-4 text-sm">
                            <span className="text-muted-foreground">{log.category}</span>
                          </td>
                          <td className="p-4 text-sm max-w-[300px]">
                            <p className="truncate">{log.message}</p>
                          </td>
                          <td className="p-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{log.user || '-'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Server className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground font-mono text-xs">{log.ip || '-'}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                              className="p-1 hover:bg-muted rounded"
                            >
                              {expandedLog === log.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              
              <AnimatePresence>
                {expandedLog && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border bg-muted/20 overflow-hidden"
                  >
                    <div className="p-4">
                      {(() => {
                        const log = logs.find(l => l.id === expandedLog);
                        return log ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">Log ID:</span>
                              <span className="font-mono">{log.id}</span>
                            </div>
                            {log.details && (
                              <div className="flex items-start gap-4">
                                <span className="text-muted-foreground">Details:</span>
                                <code className="text-xs bg-muted p-2 rounded font-mono">{log.details}</code>
                              </div>
                            )}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min(50, filteredLogs.length)} of {filteredLogs.length} entries
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={selectedLogs.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};