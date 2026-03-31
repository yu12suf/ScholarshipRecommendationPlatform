'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-context';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  Compass,
  ClipboardList,
  Menu,
  X,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export function StudentSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'Scholarships', href: '/dashboard/scholarships', icon: GraduationCap },
    { name: 'Counselors', href: '/dashboard/counselors', icon: Users },
    { name: 'Messages', href: '/dashboard/student/chat', icon: MessageSquare },
    { name: 'Assessment', href: '/dashboard/assessment', icon: ClipboardList },
    { name: 'Learning Path', href: '/dashboard/learning-path', icon: Compass },
  ];

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full bg-card">
      {/* HEADER */}
      <div className={`h-16 flex items-center border-b border-border relative ${collapsed && !mobile ? 'justify-center px-3' : 'px-5'}`}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
              <Image src="/admas.png" alt="Logo" width={36} height={36} className="h-full w-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-foreground tracking-tight">Admas</span>
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
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
              } ${collapsed && !mobile ? 'justify-center' : ''}`}
            >
              <Icon size={18} className={active ? 'text-primary' : ''} />
              {(!collapsed || mobile) && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER — Quick Settings */}
      <div className="p-3 border-t border-border">
        <Link
          href="/dashboard/settings"
          onClick={() => setMobileOpen(false)}
          title={collapsed && !mobile ? 'Settings' : undefined}
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition focus:outline-none text-muted-foreground hover:bg-muted hover:text-foreground font-medium ${collapsed && !mobile ? 'justify-center' : ''}`}
        >
          <Settings size={18} />
          {(!collapsed || mobile) && <span className="text-sm font-medium">Settings</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger — shown only on small screens */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-card border border-border rounded-lg text-foreground"
        title="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile slide-in drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 overflow-hidden"
            >
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar — hidden on mobile */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 260 }}
        className="hidden lg:flex sticky top-0 h-screen border-r border-border bg-card flex-col overflow-x-hidden"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
