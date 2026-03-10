'use client';

import { useState, useEffect } from 'react';
import { User } from '@/features/auth/types';
import { getUsersByRole } from '@/features/admin/api/admin-api';
import { Card, CardBody } from '@/components/ui';
import { Loader2, ExternalLink } from 'lucide-react';

export const StudentList = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getUsersByRole('student');
        setStudents(data);
      } catch (error) {
        console.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {students.length > 0 ? (
        students.map((student) => (
          <Card key={student.id} className="rounded-xl">
            <CardBody className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.email}</p>
                </div>
              </div>
              <button className="text-primary p-2 hover:bg-primary/5 rounded-full transition-colors">
                <ExternalLink className="h-4 w-4" />
              </button>
            </CardBody>
          </Card>
        ))
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
          <p className="text-muted-foreground text-sm">No students assigned yet.</p>
        </div>
      )}
    </div>
  );
};
