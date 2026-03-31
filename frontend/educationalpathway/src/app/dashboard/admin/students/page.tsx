import { StudentManagement } from '@/features/admin/components/StudentManagement';

export default function AdminStudentsPage() {
  return (
    <div className="space-y-10">

      {/* Page Header */}

      <div className="space-y-2">

        <h1 className="h2">
          Student Management
        </h1>

        <p className="text-small">
          Manage platform users and their academic profile data
        </p>

      </div>

      {/* Content Card */}

      <div className="bg-card rounded-lg overflow-hidden">

        <StudentManagement />

      </div>

    </div>
  );
}
