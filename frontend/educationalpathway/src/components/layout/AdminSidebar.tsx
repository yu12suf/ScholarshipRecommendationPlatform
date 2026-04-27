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
  ShieldCheck,
  GraduationCap,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Banknote
} from 'lucide-react';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    { name: 'Home', href: '/dashboard/admin', icon: Home },
    { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
    { name: 'Counselors', href: '/dashboard/admin/counselors', icon: ShieldCheck },
    { name: 'Payout Requests', href: '/dashboard/admin/payouts', icon: Banknote },
    { name: 'Platform Stats', href: '/dashboard/analytics', icon: Activity },
    { name: 'System Logs', href: '/dashboard/logs', icon: Zap },
    { name: 'Security Center', href: '/dashboard/security', icon: Shield },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="sticky top-0 h-screen border-r border-border bg-card flex flex-col overflow-x-hidden"
    >

      {/* HEADER */}

      <div className={`h-20 flex items-center border-b border-border relative ${collapsed ? 'justify-center' : 'px-6'}`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
              <Image 
                src="/admas.png" 
                alt="Logo" 
                width={40} 
                height={40} 
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight whitespace-nowrap">
              Admin Portal
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer shrink-0 ${collapsed ? 'mx-auto' : 'ml-auto'}`}
          title={collapsed ? "Open sidebar" : "Close sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>

      </div>
      {/* NAVIGATION */}

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

        {menuItems.map((item) => {

          const active = pathname === item.href;

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${active
                ? 'text-primary font-bold bg-primary/10'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium rounded-lg'
                } ${collapsed ? 'justify-center' : ''}`}
            >

              <Icon
                size={18}
                className={active ? 'text-primary' : ''}
              />

              {!collapsed && (
                <span className="text-sm font-medium">
                  {item.name}
                </span>
              )}



            </Link>
          );
        })}

      </nav>

      {/* FOOTER */}
      <div className="p-3 border-t border-border relative">

        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-3 right-3 mb-2 p-2 bg-card border border-border rounded-lg shadow-xl z-50"
            >
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer ${collapsed ? 'justify-center focus:ring-2 focus:ring-primary/20' : ''}`}
          title={collapsed ? "Admin Menu" : undefined}
        >
          <div className="h-8 w-8 rounded-full primary-gradient flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-sm font-black">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </span>
          </div>

          {!collapsed && (
            <div className="flex-1 flex items-center overflow-hidden">
              <span className="text-sm font-bold text-foreground truncate w-full text-left">
                {user?.name || 'Administrator'}
              </span>
            </div>
          )}
        </div>
      </div>

    </motion.aside>
  );
}
