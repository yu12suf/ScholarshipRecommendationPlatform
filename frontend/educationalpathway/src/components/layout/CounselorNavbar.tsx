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
import Image from 'next/image';

export function CounselorNavbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
       {/* Logo */}
       <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl shadow-lg shadow-indigo-500/10 group-hover:rotate-6 transition-transform duration-300">
            <Image 
              src="/admas.png" 
              alt="አድማስ Logo" 
              fill
              className="object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">አድማስ</h2>
            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">Counselor Portal</p>
          </div>
       </div>

       {/* Links - Simple English */}
       <div className="hidden lg:flex items-center gap-8">
          <Link href="/dashboard/counselor" className="group flex flex-col items-center gap-1 transition-all">
            <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">Dashboard</span>
            <div className="h-1 w-1 rounded-full bg-indigo-600 scale-0 group-hover:scale-100 transition-transform" />
          </Link>
          <Link href="/dashboard/students" className="group flex flex-col items-center gap-1 transition-all">
            <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600">My Students</span>
            <div className="h-1 w-1 rounded-full bg-indigo-600 scale-0 group-hover:scale-100 transition-transform" />
          </Link>
          <Link href="/dashboard/calendar" className="group flex flex-col items-center gap-1 transition-all">
            <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600">Appointments</span>
            <div className="h-1 w-1 rounded-full bg-indigo-600 scale-0 group-hover:scale-100 transition-transform" />
          </Link>
          <Link href="/dashboard/counselor/chat" className="group flex flex-col items-center gap-1 transition-all">
            <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600">Messages</span>
            <div className="h-1 w-1 rounded-full bg-indigo-600 scale-0 group-hover:scale-100 transition-transform" />
          </Link>
       </div>

       {/* Actions */}
       <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11 hover:bg-slate-50 text-slate-500">
            <Bell className="h-5 w-5" />
          </Button>
          
          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* User Profile */}
          <button className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
            <div className="h-9 w-9 rounded-sm bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-500/20 group-hover:-rotate-3 transition-transform">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div className="text-left leading-tight pr-1 hidden sm:block">
              <p className="text-sm font-black text-slate-900 tracking-tight">{user?.name || 'Counselor'}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expert</p>
            </div>
          </button>

          <Button onClick={logout} variant="ghost" className="text-rose-500 hover:bg-rose-50 font-black h-11 px-4 rounded-2xl hidden md:flex uppercase tracking-tight text-xs">
             <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
       </div>
      </div>
    </nav>
  );
}
