'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-context';
import { Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminFooter } from '@/components/layout/AdminFooter';
import { CounselorNavbar } from '@/components/layout/CounselorNavbar';
import { StudentNavbar } from '@/components/layout/StudentNavbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Admin Layout (Sidebar based)
  if (user.role === 'admin') {
    return (
      <div className="min-h-screen flex bg-slate-950">
        <AdminSidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-12 lg:py-16 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
            <AdminFooter />
          </main>
        </div>
      </div>
    );
  }

  // Counselor Layout
  if (user.role === 'counselor') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <CounselorNavbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Student & Default Layout
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <StudentNavbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
