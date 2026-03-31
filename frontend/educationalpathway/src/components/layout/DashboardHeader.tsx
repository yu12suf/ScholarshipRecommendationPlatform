'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { GlobalSearch } from '@/features/search/components/GlobalSearch';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { useAuth } from '@/providers/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User } from 'lucide-react';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-6 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      {/* Global Search Component */}
      <div className="hidden md:flex flex-1 max-w-md">
        <GlobalSearch />
      </div>

      <div className="flex-1 md:hidden" />

      {/* Actions */}
      <div className="flex items-center gap-4">
        <NotificationBell />
        
        {/* User Profile */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-muted hover:rounded-full transition-all focus:outline-none cursor-pointer"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div className="h-8 w-8 rounded-full primary-gradient flex items-center justify-center shrink-0">
              <span className="text-primary-foreground text-xs font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg py-1 z-50 overflow-hidden"
              >
                {/* User Profile Info */}
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <p className="text-sm font-bold text-foreground truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || 'email@example.com'}
                  </p>
                </div>

                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-4 py-2.5 mt-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User size={16} />
                  <span>Profile Info</span>
                </Link>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => { setShowUserMenu(false); logout(); }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer w-full text-left"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
