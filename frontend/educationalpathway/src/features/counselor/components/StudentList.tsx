'use client';

import { useState, useEffect } from 'react';
import { User } from '@/features/auth/types';
import { getBookedStudents, getUsersByRole } from '@/features/admin/api/admin-api';
import { Card, CardBody, Button } from '@/components/ui';
import { Loader2, ExternalLink, User as UserIcon, Mail, Calendar, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/providers/auth-context';

import { getCounselorStudents, CounselorStudent } from '../api/counselor-api';

export const StudentList = () => {
  const [students, setStudents] = useState<CounselorStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const data = await getCounselorStudents();
        setStudents(data);
      } catch (error) {
        console.error('Failed to load students:', error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [user]);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {students.length > 0 ? (
        students.map((student) => (
          <Card key={student.studentId} className="rounded-lg border-slate-100">
            <CardBody className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 primary-gradient rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/20">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-foreground">{student.name}</p>
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mt-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {student.email}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> 
                      <span className="opacity-80">Last:</span> {new Date(student.lastBookingDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-widest ${
                  student.lastBookingStatus === 'completed' ? 'bg-success/10 text-success border border-success/20' :
                  student.lastBookingStatus === 'confirmed' ? 'bg-primary/10 text-primary border border-primary/20' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {student.lastBookingStatus}
                </span>
                <button className="text-muted-foreground p-2 hover:bg-muted rounded-lg transition-all hover:text-foreground">
                  <ExternalLink className="h-5 w-5" />
                </button>
              </div>
            </CardBody>
          </Card>
        ))
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-lg border-2 border-dashed border-border/50">
          <UserIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No students assigned yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Your mentorship list will appear here once students book a session.</p>
        </div>
      )}
    </div>
  );
};
