'use client';

import { useAuth } from '@/providers/auth-context';
import { Users, Calendar, MessageSquare, TrendingUp, ChevronRight } from 'lucide-react';
import { Button, Card, CardBody } from '@/components/ui';
import { StudentList } from './StudentList';

export const CounselorDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Students', value: '0', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Sessions', value: '0', icon: Calendar, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Messages', value: '0', icon: MessageSquare, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Success Rate', value: '--', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Welcome */}
      <section className="relative overflow-hidden rounded-xl bg-primary p-8 md:p-12 scholarship-gradient shadow-2xl shadow-primary/20">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Welcome Back, <span className="text-secondary italic">{user?.name}!</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium max-w-md">
            Empower your students and guide them through their academic journey.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button className="bg-white text-primary hover:bg-white/90 font-black px-6 h-12 rounded-xl">
              Schedule Session
            </Button>
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 font-bold px-6 h-12 rounded-xl">
              View All Students
            </Button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 mr-10 mb-10 opacity-10">
          <Users className="h-64 w-64 text-white" />
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Students */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Students</h2>
            <Button variant="ghost" size="sm" className="text-primary font-bold">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-4">
            <StudentList />
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
          <Card className="p-6 rounded-xl">
            <CardBody className="text-center py-8">
              <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-medium">No sessions scheduled for today</p>
            </CardBody>
          </Card>
          
          <Button className="w-full h-12 scholarship-gradient border-none font-bold shadow-lg shadow-primary/20">
            Set Availability
          </Button>
        </div>
      </div>
    </div>
  );
};
