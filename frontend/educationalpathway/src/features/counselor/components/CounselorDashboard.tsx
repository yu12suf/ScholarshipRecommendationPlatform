'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-context';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  ChevronRight, 
  Search,
  Filter,
  UserPlus,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { StudentList } from './StudentList';
import { motion } from 'framer-motion';
import { getBookedStudents } from '@/features/admin/api/admin-api';

export const CounselorDashboard = () => {
  const { user } = useAuth();
  const [studentCount, setStudentCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const students = await getBookedStudents();
        setStudentCount(students.length);
      } catch (error) {
        console.error('Failed to fetch counselor stats:', error);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Total Students', value: studentCount?.toString() || '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'Assigned to you' },
    { label: 'Upcoming Sessions', value: '0', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: 'Schedule clear' },
    { label: 'Unread Messages', value: '0', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-100', trend: 'No new alerts' },
    { label: 'Success Rate', value: '--', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: 'Tracked annually' },
  ];

  return (
    <div className="relative min-h-screen space-y-8 pb-12 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-400/10 rounded-full blur-[100px] -z-10" />

      {/* Hero Welcome Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 shadow-slate-900/20"
      >
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Counselor Portal
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
            Welcome back, <br/>
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent italic">{user?.name}</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
            You are currently managing <span className="text-white font-bold">{studentCount || 0} students</span>. Check their progress and provide guidance below.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 h-14 rounded-lg shadow-blue-600/20 transition-all hover:scale-105">
              <UserPlus className="mr-2 h-5 w-5" /> All Students
            </Button>
            <Button size="lg" variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold px-8 h-14 rounded-lg backdrop-blur-md">
              <Calendar className="mr-2 h-5 w-5" /> My Schedule
            </Button>
          </div>
        </div>
        
        {/* Decorative Background Icon */}
        <div className="absolute top-0 right-0 mt-8 mr-8 opacity-[0.03] rotate-12">
          <Users className="h-64 w-64 text-white" />
        </div>
      </motion.section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200 hover:border-blue-300 hover: hover:shadow-blue-500/5 transition-all cursor-default"
          >
            <div className={`w-14 h-14 rounded-lg ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`h-7 w-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1">
                {stat.trend}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Students Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Student Overview</h2>
              <p className="text-sm text-slate-500 font-medium">Manage your assigned students and their progress</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg border-slate-200">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg border-slate-200">
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-slate-200 overflow-hidden">
            <StudentList />
          </div>
        </motion.div>

        {/* Sidebar / Secondary Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="px-2">
            <h2 className="text-2xl font-black text-slate-900">Upcoming</h2>
            <p className="text-sm text-slate-500 font-medium">Your schedule for the next 24h</p>
          </div>

          <Card className="rounded-[2rem] border-slate-200 overflow-hidden bg-gradient-to-br from-white to-slate-50">
            <CardBody className="p-8 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-slate-300" />
              </div>
              <p className="text-slate-900 font-black text-xl mb-2">Clear Schedule</p>
              <p className="text-slate-500 text-sm font-medium mb-8">
                No sessions scheduled for the rest of today. Take some time to review student applications!
              </p>
              <Button className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-slate-900/10">
                Update Availability
              </Button>
            </CardBody>
          </Card>

          {/* Quick Tips or Insights */}
          <div className="p-6 rounded-[2rem] bg-indigo-600 text-white shadow-indigo-600/20">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">Pro Tip</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Boost Engagement</h3>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Students who receive feedback within 24 hours are 3x more likely to complete their applications.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
