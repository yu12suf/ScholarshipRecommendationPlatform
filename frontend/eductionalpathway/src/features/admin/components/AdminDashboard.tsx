'use client';

import { useAuth } from '@/providers/auth-context';
import { Shield, Users, Activity, Settings } from 'lucide-react';
import { Button } from '@/components/ui';
import { UserManagement } from './UserManagement';

export const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Users', value: '124', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active Sessions', value: '12', icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Reports', value: '5', icon: Shield, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'System Health', value: '98%', icon: Settings, color: 'text-secondary', bg: 'bg-secondary/10' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Welcome */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 shadow-2xl shadow-slate-900/20">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            System <span className="text-secondary italic">Control</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-md">
            Monitor platform health, manage user permissions, and oversee counselor activities.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button className="bg-white text-slate-900 hover:bg-white/90 font-black px-6 h-12 rounded-xl">
              System Logs
            </Button>
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 font-bold px-6 h-12 rounded-xl">
              Configuration
            </Button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 mr-10 mb-10 opacity-10">
          <Shield className="h-64 w-64 text-white" />
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900">User Management</h2>
          <Button variant="outline" className="font-bold border-2 rounded-xl">Export Data</Button>
        </div>
        <UserManagement />
      </div>
    </div>
  );
};
