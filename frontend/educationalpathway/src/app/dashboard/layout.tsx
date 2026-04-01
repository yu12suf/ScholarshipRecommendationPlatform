'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-context';
import { Loader2 } from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { CounselorSidebar } from '@/components/layout/CounselorSidebar';
import { StudentSidebar } from '@/components/layout/StudentSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isStudentOnboarding = pathname.startsWith('/dashboard/student/profile');
  const isCounselorOnboarding = pathname.startsWith('/dashboard/counselor/profile');

  /* ---------------- ADMIN LAYOUT ---------------- */

  if (user.role === 'admin') {
    return (
      <div className="h-screen flex flex-row bg-background overflow-hidden">

        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0">

          <main className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 lg:px-10">

            <div className="max-w-7xl mx-auto">
              {children}
            </div>

          </main>

        </div>

      </div>
    );
  }

  /* ---------------- COUNSELOR LAYOUT ---------------- */

  if (user.role === 'counselor') {
    return (
      <div className="h-screen flex flex-row bg-background overflow-hidden">

        {!isCounselorOnboarding && <CounselorSidebar />}

        <div className="flex-1 flex flex-col min-w-0 h-screen">

          {!isCounselorOnboarding && <DashboardHeader />}

          <main className={`flex-1 overflow-y-auto custom-scrollbar ${isCounselorOnboarding ? '' : 'px-6 py-8'}`}>

            <div className="max-w-7xl mx-auto h-full">
              {children}
            </div>

          </main>

        </div>

      </div>
    );
  }

  /* ---------------- STUDENT LAYOUT ---------------- */

  return (
    <div className="h-screen flex flex-row bg-background overflow-hidden">

      {!isStudentOnboarding && <StudentSidebar />}

      <div className="flex-1 flex flex-col min-w-0 h-screen">

        {!isStudentOnboarding && <DashboardHeader />}

        <main
          className={`flex-1 overflow-y-auto custom-scrollbar ${
            isStudentOnboarding ? '' : 'px-6 py-8'
          }`}
        >

          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>

        </main>

      </div>

    </div>
  );
}
