'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-context';
import { 
  Shield, 
  Users, 
  Activity, 
  Settings, 
  Zap, 
  Database, 
  AlertCircle, 
  LayoutDashboard, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/dashboard/users', icon: Users },
    { name: 'Platform Stats', href: '/dashboard/analytics', icon: Activity },
    { name: 'System Logs', href: '/dashboard/logs', icon: Zap },
    { name: 'Security Center', href: '/dashboard/security', icon: Shield },
    { name: 'Configurations', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="sticky top-0 h-screen bg-slate-950 border-r border-slate-800 flex flex-col z-50 transition-all duration-300"
    >
      {/* Sidebar Header */}
      <div className="h-20 flex items-center px-6 relative border-b border-slate-800">
        <Link href="/dashboard/admin" className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-black text-white tracking-tighter"
              >
                ADMIN <span className="text-indigo-500">ROOT</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-indigo-600 border border-indigo-500 rounded-full flex items-center justify-center text-white hover:bg-indigo-500 transition-colors z-50 shadow-lg"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b border-slate-800">
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-white/5 ${collapsed ? 'justify-center px-0' : ''}`}>
           <div className="h-10 w-10 min-w-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
               <p className="text-sm font-bold text-white truncate">{user?.name || 'Administrator'}</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase truncate">Lead System Op</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              } ${collapsed ? 'justify-center px-0 p-3' : ''}`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
              {!collapsed && (
                <span className="text-sm font-bold tracking-tight">{item.name}</span>
              )}
              {collapsed && (
                <div className="absolute left-16 px-2 py-1 bg-slate-900 border border-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-xs whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all ${collapsed ? 'justify-center p-3' : ''}`}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="text-sm font-bold tracking-tight">System Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
