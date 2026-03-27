'use client';

import { GlobalSearch } from '@/features/search/components/GlobalSearch';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';

export function DashboardHeader() {
  return (
    <header className="h-16 px-6 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      {/* Global Search Component */}
      <div className="hidden md:flex flex-1 max-w-md">
        <GlobalSearch />
      </div>

      <div className="flex-1 md:hidden" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <NotificationBell />
      </div>
    </header>
  );
}
