'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-context';
import { Shield, Users, Activity, Settings, Zap, Database, AlertCircle, GraduationCap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserManagement } from './UserManagement';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminStats, AdminStats } from '../api/admin-api';

export const AdminDashboard = () => {
  const { user } = useAuth();
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
    { label: 'Total Users', value: stats?.totalUsers.toString() || '0', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: 'Live count' },
    { label: 'Students', value: stats?.students.toString() || '0', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: 'Active applicants' },
    { label: 'Counselors', value: stats?.counselors.toString() || '0', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'Verified advisors' },
    { label: 'Platform Load', value: 'Optimal', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100', trend: 'Healthy status' },
  ];

  return (
    <div className="relative min-h-screen space-y-10 pb-12 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      {/* Hero Welcome section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-10 md:p-14 shadow-2xl shadow-indigo-900/20"
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
              <Shield className="h-3 w-3" />
              Administrative Root
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-[1.1]">
              System <br/>
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Operations</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-lg mb-12 leading-relaxed">
              Global oversight of user permissions, platform infrastructure, and security enforcement.
            </p>
            <div className="flex flex-wrap gap-5">
              <Button className="bg-white text-slate-950 hover:bg-slate-100 font-black px-10 h-16 rounded-[1.5rem] shadow-xl transition-all hover:scale-105 active:scale-95 text-base">
                <Settings className="mr-3 h-5 w-5" /> Config Center
              </Button>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 font-bold px-10 h-16 rounded-[1.5rem] backdrop-blur-md text-base transition-all">
                <Zap className="mr-3 h-5 w-5" /> System Logs
              </Button>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="h-32 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm p-6">
                <p className="text-xs text-slate-500 font-bold uppercase mb-2">Database</p>
                <p className="text-emerald-400 font-black text-2xl">Operational</p>
              </div>
              <div className="h-48 rounded-3xl bg-indigo-600 shadow-xl shadow-indigo-600/20 p-6 flex flex-col justify-between">
                <Shield className="h-8 w-8 text-white/50" />
                <p className="text-white font-black text-xl leading-snug">System Security <br/> Fully Protected</p>
              </div>
            </div>
            <div className="pt-12 space-y-4">
               <div className="h-48 rounded-3xl bg-slate-800 border border-slate-700 p-6 flex flex-col justify-between">
                <Activity className="h-8 w-8 text-indigo-400" />
                <p className="text-white font-black text-xl leading-snug">Platform Traffic <br/> Stable</p>
              </div>
              <div className="h-32 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm p-6">
                <p className="text-xs text-slate-500 font-bold uppercase mb-2">Auto-Backups</p>
                <p className="text-white font-black text-2xl tracking-tight italic text-blue-400">Enabled</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Decorative */}
        <div className="absolute -bottom-24 -right-24 h-[500px] w-[500px] bg-indigo-600/10 rounded-full blur-[100px]" />
      </motion.section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-200 hover:border-indigo-300 transition-all duration-300"
          >
            <div className="p-6 flex items-center gap-5">
              <div className={`w-16 h-16 rounded-[1.8rem] ${stat.bg} flex items-center justify-center group-hover:rotate-6 transition-transform duration-500`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-950 tracking-tight">{stat.value}</p>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 rounded-[1.8rem] m-1 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <p className="text-[10px] font-bold text-slate-500">{stat.trend}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-8"
      >
        <div className="flex items-end justify-between px-4">
          <div>
            <h2 className="text-4xl font-black text-slate-950 tracking-tighter">User Directory</h2>
            <p className="text-slate-500 font-medium">Control levels and security clearances</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="font-bold rounded-2xl border-slate-300 h-14 px-8">Audit Logs</Button>
            <Button className="bg-slate-950 text-white font-bold rounded-2xl h-14 px-8 shadow-xl shadow-slate-950/10 active:scale-95 transition-all">Export JSON</Button>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <UserManagement />
        </div>
      </motion.div>
    </div>
  );
};
