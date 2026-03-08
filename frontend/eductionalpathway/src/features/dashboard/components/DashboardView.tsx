'use client';

import { useAuth } from '@/providers/auth-context';
import { StudentDashboard } from '@/features/student/components/StudentDashboard';
import { CounselorDashboard } from '@/features/counselor/components/CounselorDashboard';
import { AdminDashboard } from '@/features/admin/components/AdminDashboard';

export const DashboardView = () => {
  const { user } = useAuth();

  if (user?.role === 'counselor') {
    return <CounselorDashboard />;
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
};
