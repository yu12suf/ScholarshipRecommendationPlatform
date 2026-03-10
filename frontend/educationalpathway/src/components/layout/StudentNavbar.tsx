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
  GraduationCap,
  Sparkles,
  Trophy,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export function StudentNavbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-4 z-50 mx-auto w-full max-w-7xl px-8 h-20 bg-slate-950 border border-slate-800 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 flex items-center justify-between mb-10 transition-all">
       {/* Logo */}
       <div className="flex items-center gap-4">
          <div className="p-2.5 bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-indigo-500/30 animate-pulse">
            <Rocket className="h-6 w-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-xl font-black text-white tracking-tighter leading-none">EduPathway</h2>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1 italic">Adventure Hub</p>
          </div>
       </div>

       {/* Links */}
       <div className="hidden lg:flex items-center gap-10">
          <Link href="/dashboard/student" className="text-sm font-black text-white border-b-2 border-indigo-500 pb-1 flex items-center gap-2 tracking-tighter uppercase">
            <LayoutDashboard className="h-4 w-4" /> Hub
          </Link>
          <Link href="/dashboard/scholarships" className="text-sm font-black text-slate-400 hover:text-white transition-colors flex items-center gap-2 tracking-tighter uppercase">
            <Sparkles className="h-4 w-4" /> Finder
          </Link>
          <Link href="/dashboard/counselors" className="text-sm font-black text-slate-400 hover:text-white transition-colors flex items-center gap-2 tracking-tighter uppercase">
             <Trophy className="h-4 w-4" /> Advisors
          </Link>
          <Link href="/dashboard/assessment" className="text-sm font-black text-slate-400 hover:text-white transition-colors flex items-center gap-2 tracking-tighter uppercase">
            <Rocket className="h-4 w-4" /> Goal Path
          </Link>
       </div>

       {/* Actions */}
       <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 blink" />
            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Profile: 78% Match</span>
          </div>

          <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 hover:bg-white/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-slate-400" />
          </Button>
          
          <div className="h-10 w-px bg-slate-800 mx-1 hidden sm:block" />

          <button className="flex items-center gap-3 p-1 rounded-full pr-4 border border-white/10 hover:bg-white/5 transition-all">
            <div className="h-10 w-10 min-w-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="text-left leading-tight pr-2 hidden sm:block">
              <p className="text-sm font-bold text-white tracking-tighter">{user?.name || 'Student'}</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Scholar Traveler</p>
            </div>
          </button>

          <Button onClick={logout} variant="ghost" className="text-rose-400 hover:bg-rose-500/10 font-black h-11 px-5 rounded-2xl hidden md:flex uppercase tracking-tighter">
             <LogOut className="h-4 w-4 mr-2" /> Exit Hub
          </Button>
       </div>
    </nav>
  );
}
