import { AdminDashboard } from '@/features/admin/components/AdminDashboard';

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase">User Control</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Manage platform access and security levels</p>
      </div>
      <AdminDashboard /> 
    </div>
  );
}
