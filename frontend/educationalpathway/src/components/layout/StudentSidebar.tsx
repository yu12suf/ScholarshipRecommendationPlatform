'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-context';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  LogOut,
  Settings,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StudentSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'Scholarships', href: '/dashboard/scholarships', icon: GraduationCap },
    { name: 'Counselors', href: '/dashboard/counselors', icon: Users },
    { name: 'Learn', href: '/dashboard/assessment', icon: BookOpen },
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
            <div className="h-10 w-10 rounded-full primary-gradient flex items-center justify-center shrink-0">
              <GraduationCap size={18} className="text-primary-foreground"/>
            </div>

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
                : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium rounded-sm'
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
              transition={{ duration: 0.2 }}
              className={`absolute bottom-full mb-2 bg-card border border-border rounded-lg shadow-lg py-1 flex flex-col overflow-hidden z-50 ${collapsed ? 'left-3 right-3 items-center' : 'left-3 right-3'}`}
            >
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${collapsed ? 'justify-center px-0 w-full' : ''}`}
                onClick={() => setShowUserMenu(false)}
                title={collapsed ? "Settings" : undefined}
              >
                <Settings size={16} />
                {!collapsed && <span>Settings</span>}
              </Link>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer w-full text-left ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? "Logout" : undefined}
              >
                <LogOut size={16} />
                {!collapsed && <span>Logout</span>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? "Profile" : undefined}
        >
          <div className="h-8 w-8 rounded-full primary-gradient flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-sm font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>

          {!collapsed && (
            <div className="flex-1 flex flex-col items-start overflow-hidden">
              <span className="text-sm font-medium text-foreground truncate w-full text-left">
                {user?.name || 'User'}
              </span>
              <span className="text-xs text-muted-foreground truncate w-full text-left">
                Student
              </span>
            </div>
          )}
        </button>

      </div>

    </motion.aside>
  );
}
