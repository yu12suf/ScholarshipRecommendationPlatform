'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-context';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarCheck,
  MessageSquare,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';

export function CounselorSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard/counselor', icon: LayoutDashboard },
    { name: 'My Students', href: '/dashboard/students', icon: Users },
    { name: 'Schedule Explorer', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Active Sessions', href: '/dashboard/counselor/bookings', icon: CalendarCheck },
    { name: 'Messages', href: '/dashboard/counselor/chat', icon: MessageSquare },
    { name: 'Goal Tracking', href: '/dashboard/counselor/tasks', icon: ClipboardList },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full bg-card">
      {/* HEADER */}
      <div className={`h-16 flex items-center border-b border-border relative ${collapsed && !mobile ? 'justify-center px-3' : 'px-5'}`}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              <Image src="/admas.png" alt="Logo" width={36} height={36} className="h-full w-full object-cover" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">አድማስ</span>
          </div>
        )}
        
        {mobile ? (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={20} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer shrink-0 ${collapsed ? 'mx-auto' : 'ml-auto'}`}
            title={collapsed ? 'Open sidebar' : 'Close sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        )}
      </div>

      {/* NAV */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed && !mobile ? item.name : undefined}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition focus:outline-none ${
                active
                  ? 'text-primary font-bold bg-primary/10'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
              } ${collapsed && !mobile ? 'justify-center px-0' : ''}`}
            >
              <Icon size={18} className={active ? 'text-primary' : 'group-hover:scale-110 transition-transform'} />
              {(!collapsed || mobile) && <span className="text-sm tracking-tight">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-3 border-t border-border">
        <Link
          href="/dashboard/counselor/profile"
          onClick={() => setMobileOpen(false)}
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition focus:outline-none text-muted-foreground hover:bg-muted hover:text-foreground font-medium ${collapsed && !mobile ? 'justify-center px-0' : ''}`}
        >
          <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck size={14} className="text-primary" />
          </div>
          {(!collapsed || mobile) && <span className="text-sm font-medium">Verification</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-40 p-3 bg-card border border-border rounded-lg text-foreground shadow-xl"
        title="Open menu"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-slate-900 border-r border-white/10 z-50 overflow-hidden"
            >
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 100 : 300 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="hidden lg:flex sticky top-0 h-screen border-r border-border bg-card flex-col overflow-x-hidden z-30"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
