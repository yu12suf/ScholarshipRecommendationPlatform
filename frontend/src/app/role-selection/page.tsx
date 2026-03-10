import { RoleSelection } from '@/features/auth/components/RoleSelection';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 py-12">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary">EduPathway</span>
        </Link>
      </div>
      
      <RoleSelection />
    </div>
  );
}
