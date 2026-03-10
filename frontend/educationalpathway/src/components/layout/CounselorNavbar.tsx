'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth-context';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  LayoutDashboard, 
  LogOut,
  Bell,
  Search,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export function CounselorNavbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-4 z-50 mx-auto w-[98%] max-w-7xl px-6 h-20 bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2rem] shadow-xl shadow-blue-500/5 flex items-center justify-between mb-8 transition-all">
       {/* Logo */}
       <div className="flex items-center gap-3">
          <div className="p-2.5 bg-linear-to-br from-blue-600 to-emerald-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Counselor</h2>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Advisor Portal</p>
          </div>
       </div>

       {/* Links */}
       <div className="hidden lg:flex items-center gap-8">
          <Link href="/dashboard/counselor" className="text-sm font-bold text-slate-900 border-b-2 border-blue-600 pb-1">Dashboard</Link>
          <Link href="/dashboard/students" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Students</Link>
          <Link href="/dashboard/calendar" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Schedule</Link>
          <Link href="/dashboard/messages" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2">
            Inbox <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          </Link>
       </div>

       {/* Actions */}
       <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 hover:bg-slate-100 flex items-center justify-center">
            <Bell className="h-5 w-5 text-slate-500" />
          </Button>
          
          <div className="h-10 w-px bg-slate-200 mx-2 hidden sm:block" />

          <button className="hidden sm:flex items-center gap-3 p-1 rounded-full pr-4 border border-slate-100 hover:bg-slate-50 transition-all">
            <div className="h-10 w-10 min-w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div className="text-left leading-tight pr-2">
              <p className="text-sm font-bold text-slate-900">{user?.name || 'Counselor'}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Expert Advisor</p>
            </div>
          </button>

          <Button onClick={logout} variant="ghost" className="text-rose-500 hover:bg-rose-50 font-bold h-11 px-5 rounded-xl hidden md:flex">
             <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
       </div>
    </nav>
  );
}
