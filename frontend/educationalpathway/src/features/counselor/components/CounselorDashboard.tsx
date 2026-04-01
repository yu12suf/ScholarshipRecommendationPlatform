'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-context';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  ChevronRight, 
  Search,
  Filter,
  UserPlus,
  ShieldCheck,
  CalendarCheck,
  Clock,
  CheckCircle2,
  Award,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { StudentList } from './StudentList';
import { motion } from 'framer-motion';
import { 
  getCounselorDashboardOverview, 
  CounselorDashboardOverview,
  getCounselorProfile 
} from '@/features/counselor/api/counselor-api';
import { useRouter } from 'next/navigation';

export const CounselorDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [statsData, setStatsData] = useState<CounselorDashboardOverview | null>(null);
  const [counselorProfile, setCounselorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, profile] = await Promise.all([
          getCounselorDashboardOverview(),
          getCounselorProfile()
        ]);
        setStatsData(stats);
        setCounselorProfile(profile);
      } catch (error) {
        console.error('Failed to fetch counselor data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (counselorProfile && !counselorProfile.isOnboarded) {
      router.push("/dashboard/counselor/profile");
    }
  }, [counselorProfile, counselorProfile?.isOnboarded, router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle Onboarding / Verification States
  if (counselorProfile?.verificationStatus === 'pending') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="max-w-xl w-full border-border bg-card shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 primary-gradient animate-pulse" />
          <CardBody className="p-12 text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto border-4 border-warning/20">
              <Clock className="h-10 w-10 text-warning" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black tracking-tight">Verification Under Review</h1>
              <p className="text-muted-foreground leading-relaxed">
                Our administrative team is currently reviewing your application. This process usually takes <span className="font-bold text-foreground">24-48 hours</span>.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs font-semibold text-muted-foreground">
                We'll notify you via email as soon as your profile is approved.
              </p>
            </div>
            <Button variant="outline" className="w-full h-12 border-border" onClick={() => window.location.reload()}>
              Check Status
            </Button>
            <div className="pt-2 text-center">
              <button 
                onClick={() => {
                   localStorage.removeItem('accessToken');
                   window.location.href = '/login';
                }}
                className="text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Logout
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (counselorProfile.verificationStatus === 'rejected') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="max-w-xl w-full border-border bg-card shadow-2xl">
          <CardBody className="p-12 text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight">Application Rejected</h1>
              <p className="text-muted-foreground">Unfortunately, your counselor application was not approved at this time.</p>
            </div>
            <p className="text-sm text-muted-foreground pb-4">
              Common reasons include incomplete documentation or mismatch with platform requirements. Please contact support for more details.
            </p>
            <Button variant="outline" className="w-full h-12 border-border">
              Contact Support
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground space-y-8 pb-20 max-w-[1600px] mx-auto">
      
      {/* Dynamic Header & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-3 rounded-lg border border-border bg-card p-6 flex items-center justify-between relative overflow-hidden shadow-sm"
        >
          <div className="flex flex-wrap gap-4 relative z-10">
            <Link href="/dashboard/counselor/bookings">
              <Button className="primary-gradient text-white shadow-lg shadow-primary/20 h-12 px-6">
                <CalendarCheck className="mr-2 h-4 w-4" /> Manage Bookings
              </Button>
            </Link>
            <Link href="/dashboard/counselor/chat">
              <Button variant="outline" className="border-border hover:bg-muted text-sm px-6 h-12">
                <MessageSquare className="mr-2 h-4 w-4" /> Active Chats
              </Button>
            </Link>
          </div>

          {/* Decorative background shape */}
          <div className="absolute top-0 right-0 -mt-24 -mr-24 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
        </motion.div>

        <Card className="border-border bg-card shadow-sm group hover:border-primary/30 transition-all">
          <CardBody className="p-8 flex flex-col items-center justify-center text-center h-full space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-small font-black uppercase tracking-tighter opacity-60">Total Impact</p>
              <h3 className="text-4xl font-black text-foreground mt-1">
                {statsData?.assignedStudents || 0}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1 font-bold">Mentees Guided</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Activity Pulse (Middle Content) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-end border-b border-border pb-4">
            <div>
              <h2 className="h3">Mentorship Overview</h2>
              <p className="text-small mt-1">Assigned students and their engagement levels.</p>
            </div>
            <Link href="/dashboard/students" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
              Explore All <ChevronRight size={14} />
            </Link>
          </div>

          <Card className="border-border bg-card overflow-hidden shadow-sm">
            <StudentList />
          </Card>
        </div>

        {/* Sidebar: Insights & Short Term Goals */}
        <div className="space-y-8 flex flex-col h-full">
          {/* Actionable Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-card border-border border-l-4 border-l-primary hover:translate-y-[-2px] transition-transform shadow-sm">
              <CardBody className="p-6">
                <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-3">Pending</p>
                <div className="flex items-end justify-between">
                  <h4 className="text-2xl font-black">{statsData?.pendingBookings || 0}</h4>
                  <div className="p-2 bg-muted rounded-lg"><Clock size={16} className="text-warning" /></div>
                </div>
              </CardBody>
            </Card>
            <Card className="bg-card border-border border-l-4 border-l-success hover:translate-y-[-2px] transition-transform shadow-sm">
              <CardBody className="p-6">
                <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground mb-3">Completed</p>
                <div className="flex items-end justify-between">
                  <h4 className="text-2xl font-black">{statsData?.completedSessions || 0}</h4>
                  <div className="p-2 bg-muted rounded-lg"><CheckCircle2 size={16} className="text-success" /></div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Quick Tasks / Next Session */}
          <Card className="border-border bg-card shadow-sm flex-1">
            <CardBody className="p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-sm uppercase tracking-widest">Immediate Agenda</h3>
                <div className="p-1 px-2 bg-muted rounded-lg text-[10px] font-bold">Upcoming</div>
              </div>

              {statsData && statsData.upcomingBookings > 0 ? (
                <div className="space-y-6 flex-1">
                  {[1, 2].map((_, i) => (
                    <div key={i} className="flex gap-4 group cursor-pointer hover:translate-x-2 transition-transform">
                      <div className="w-1 px-0.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">In 2 hours</p>
                        <p className="text-sm font-bold leading-none">Scholarship Strategy Review</p>
                        <p className="text-xs text-muted-foreground mt-2">with Student Application #{1241 + i}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-60 grayscale group hover:grayscale-0 transition-all">
                  <div className="p-4 bg-muted rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Calendar size={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-xs font-bold text-center">No immediate sessions.<br/><span className="text-[10px] opacity-70">Focus on mentee progress.</span></p>
                </div>
              )}

              <Button className="w-full mt-10 h-12 bg-muted text-foreground hover:bg-primary hover:text-white border-border gap-2 font-bold transition-all shadow-sm">
                <Filter size={16} /> Open Full Schedule
              </Button>
            </CardBody>
          </Card>

          {/* Engagement Card */}
          <div className="p-8 rounded-lg bg-primary/10 border border-primary/20 shadow-inner group overflow-hidden relative">
            <div className="relative z-10 flex items-start gap-4">
              <div className="p-2.5 bg-primary rounded-lg shadow-md group-hover:rotate-12 transition-transform">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-sm text-primary uppercase tracking-tighter">Pro Insight</h3>
                <p className="text-foreground/80 text-xs leading-relaxed font-medium">
                  Reviewing student drafts 48h before deadlines increases successful matching by 72%. 
                </p>
              </div>
            </div>
            {/* Visual fluff */}
            <div className="absolute bottom-0 right-0 p-4 opacity-5 translate-y-4 group-hover:translate-y-0 transition-transform">
              <Award size={100} strokeWidth={1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
