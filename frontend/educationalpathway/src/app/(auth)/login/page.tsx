import { LoginForm } from '@/features/auth/components/LoginForm';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-gray-50 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 scholarship-gradient rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tight">EduPathway</span>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">
        <LoginForm />
      </div>
    </div>
  );
}
