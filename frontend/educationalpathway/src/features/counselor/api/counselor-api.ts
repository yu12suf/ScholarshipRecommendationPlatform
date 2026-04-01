import api from '@/lib/api';

export interface CounselorDashboardOverview {
  assignedStudents: number;
  upcomingBookings: number;
  completedSessions: number;
  pendingBookings: number;
}

export interface CounselorStudent {
  studentId: number;
  userId: number;
  name: string;
  email: string;
  lastBookingDate: string;
  lastBookingStatus: string;
}

export const getCounselorDashboardOverview = async (): Promise<CounselorDashboardOverview> => {
  const response = await api.get('/counselors/dashboard/overview');
  return response.data;
};

export const getCounselorStudents = async (): Promise<CounselorStudent[]> => {
  const response = await api.get('/counselors/students');
  return response.data;
};

export const getUpcomingBookings = async () => {
  const response = await api.get('/counselors/bookings/upcoming');
  return response.data;
};

export const getCounselorProfile = async () => {
  const response = await api.get('/counselors/me');
  return response.data;
};

export const updateCounselorProfile = async (data: any) => {
  const response = await api.put('/counselors/profile', data);
  return response.data;
};

export const getCounselorSlots = async () => {
  const response = await api.get('/counselors/slots');
  return response.data;
};

export const createCounselorSlots = async (slots: any[]) => {
  const response = await api.post('/counselors/slots', { slots });
  return response.data;
};

export const updateBookingStatus = async (id: number, status: string) => {
  const response = await api.patch(`/counselors/bookings/${id}/status`, { status });
  return response.data;
};

export const applyAsCounselor = async (data: any) => {
  const response = await api.post('/counselors/apply', data);
  return response.data;
};

export const getRecommendedCounselors = async (): Promise<any[]> => {
  const response = await api.get('/counselors/recommendations/me');
  return response.data.data || [];
};
