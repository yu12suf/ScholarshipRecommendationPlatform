import { StudentList } from '@/features/counselor/components/StudentList';

export default function AssignedStudentsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="h1">Assigned Students</h1>
        <p className="text-muted-foreground mt-1">Manage the students who have booked sessions or are under your direct mentorship.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <StudentList />
      </div>
    </div>
  );
}
