'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-context';
import { Loader2 } from 'lucide-react';

export const DashboardView = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
        return;
      }

      if (user.role === 'admin') {
        router.replace('/dashboard/admin');
      } else if (user.role === 'counselor') {
        router.replace('/dashboard/counselor');
      } else if (user.isOnboarded) {
        router.replace('/dashboard/student');
      } else {
        router.replace('/dashboard/student/profile');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};
