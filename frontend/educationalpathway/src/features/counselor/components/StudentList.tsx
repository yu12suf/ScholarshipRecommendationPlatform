'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Badge } from '@/components/ui';
import { Loader2, ExternalLink, User as UserIcon, Mail, Calendar, Clock, CheckCircle, XCircle, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/providers/auth-context';

import { getCounselorStudents, getCounselorStudentDetails, CounselorStudent, StudentListResponse } from '../api/counselor-api';

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-success/10 text-success border border-success/20';
    case 'confirmed':
      return 'bg-primary/10 text-primary border border-primary/20';
    case 'started':
      return 'bg-warning/10 text-warning border border-warning/20';
    case 'cancelled':
      return 'bg-destructive/10 text-destructive border border-destructive/20';
    case 'pending':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const StudentList = () => {
  const [students, setStudents] = useState<CounselorStudent[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<CounselorStudent | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const { user } = useAuth();

  const fetchStudents = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await getCounselorStudents({ 
        page, 
        limit: 20,
        includeHistory: true 
      });
      
      console.log('[StudentList] API Response type:', typeof response);
      console.log('[StudentList] API Response keys:', response ? Object.keys(response) : 'null');
      console.log('[StudentList] API Response:', JSON.stringify(response));
      
      let studentsData: CounselorStudent[] = [];
      let paginationData = { page: 1, limit: 20, total: 0, totalPages: 0 };
      
      if (response && typeof response === 'object') {
        if (Array.isArray(response.data) && response.pagination) {
          studentsData = response.data;
          paginationData = response.pagination;
          console.log('[StudentList] Using response.data + pagination');
        }
        else if (Array.isArray(response.students)) {
          studentsData = response.students;
          paginationData = response.pagination || paginationData;
          console.log('[StudentList] Using response.students');
        }
        else if (Array.isArray(response)) {
          studentsData = response;
          console.log('[StudentList] Using response as array');
        }
        else if (Array.isArray(response.data)) {
          studentsData = response.data;
          paginationData = response.pagination || paginationData;
          console.log('[StudentList] Using response.data');
        }
      }
      
      // Log first student to check structure
      if (studentsData.length > 0) {
        console.log('[StudentList] First student:', studentsData[0]);
        console.log('[StudentList] First student keys:', Object.keys(studentsData[0]));
        console.log('[StudentList] First student studentId:', studentsData[0].studentId);
        console.log('[StudentList] First student id:', studentsData[0].id);
        console.log('[StudentList] First student userId:', studentsData[0].userId);
        console.log('[StudentList] First student lastBookingId:', studentsData[0].lastBookingId);
      }
      
      console.log('[StudentList] Setting students with data:', studentsData);
      
      setStudents(studentsData);
      setPagination(paginationData);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

const fetchStudentDetails = async (studentId: number) => {
    setDetailsLoading(true);
    try {
      console.log('[StudentList] fetchStudentDetails called with studentId:', studentId, typeof studentId);
      const data = await getCounselorStudentDetails(studentId);
      console.log('[StudentList] Student details response:', data);
      setStudentDetails(data);
    } catch (error: any) {
      console.error('Failed to load student details:', error);
      console.error('Error response:', error?.response?.data);
      toast.error(error?.response?.data?.message || 'Failed to load student details');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const handleViewStudent = async (student: CounselorStudent) => {
    // Debug: show all keys in student object
    console.log('[StudentList] All keys in student object:', Object.keys(student));
    console.log('[StudentList] Full student:', JSON.stringify(student));
    
    // Priority: studentId > id > userId (NOT lastBookingId which is a booking ID)
    let studentId = student.studentId;
    if (!studentId) studentId = student.id;
    if (!studentId) studentId = student.userId;
    
    console.log('[StudentList] Found studentId:', studentId, '| lastBookingId (NOT USE):', student.lastBookingId);
    
    if (!studentId) {
      console.error('[StudentList] No valid student ID found in student object. Available fields:', Object.keys(student));
      toast.error('Invalid student data - no ID found');
      return;
    }
    setSelectedStudent(student);
    await fetchStudentDetails(Number(studentId));
  };

  const handleClosePanel = () => {
    setSelectedStudent(null);
    setStudentDetails(null);
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {students.length} {students.length === 1 ? 'student' : 'students'}
        </p>
      </div>

      {students.length > 0 ? (
        <>
          <div className={`grid gap-4 ${selectedStudent ? 'md:grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
            {students.map((student) => (
              <Card 
                key={student.studentId} 
                className={`rounded-lg border-slate-100 cursor-pointer hover:border-primary/50 transition-all ${selectedStudent?.studentId === student.studentId ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleViewStudent(student)}
              >
                <CardBody className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-12 w-12 primary-gradient rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/20 shrink-0">
                        {student.name && student.name !== 'Unknown' ? student.name.charAt(0).toUpperCase() : (student.phoneNumber?.slice(-4) || String(student.studentId).slice(-2))}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">
                          {student.name && student.name !== 'Unknown' ? student.name : `Student #${student.studentId}`}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3 shrink-0" /> {student.email || 'No email'}
                        </p>
                        {student.phoneNumber && (
                          <p className="text-xs text-muted-foreground truncate">
                            {student.phoneNumber}
                          </p>
                        )}
                        {student.academicStatus && (
                          <p className="text-xs text-primary truncate">
                            {student.academicStatus}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-widest ${getStatusBadgeClass(student.lastBookingStatus)}`}>
                        {student.lastBookingStatus}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {student.totalBookings} {student.totalBookings === 1 ? 'session' : 'sessions'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(student.lastBookingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span>{student.completedSessions}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" />
                      <span>{student.upcomingSessions}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => fetchStudents(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => fetchStudents(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-lg border-2 border-dashed border-border/50">
          <UserIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No students assigned yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Your mentorship list will appear here once students book a session.</p>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 primary-gradient rounded-lg flex items-center justify-center text-white font-black text-lg">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-xl">{selectedStudent.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
                </div>
              </div>
              <Button variant="ghost" onClick={handleClosePanel}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {detailsLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
              ) : studentDetails ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-primary">{studentDetails.statistics.totalBookings}</p>
                      <p className="text-xs text-muted-foreground">Total Bookings</p>
                    </div>
                    <div className="bg-success/10 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-success">{studentDetails.statistics.completedSessions}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-primary">{studentDetails.statistics.upcomingSessions}</p>
                      <p className="text-xs text-muted-foreground">Upcoming</p>
                    </div>
                    <div className="bg-destructive/10 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-destructive">{studentDetails.statistics.cancelledSessions}</p>
                      <p className="text-xs text-muted-foreground">Cancelled</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-3">Booking History</h3>
                    <div className="space-y-2">
                      {studentDetails.bookings.map((booking: any) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {booking.slotStartTime ? new Date(booking.slotStartTime).toLocaleString() : 'Slot #' + booking.slotId}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">{booking.consultationMode} sessions</p>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-widest ${getStatusBadgeClass(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Loading student details...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
