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

export const updateCounselorProfile = async (payload: any) => {
  const formData = new FormData();
  
  // Append all fields to FormData
  Object.keys(payload).forEach(key => {
    const value = payload[key];
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const response = await api.put('/counselors/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
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

export const applyAsCounselor = async (payload: any) => {
  const formData = new FormData();
  
  // Append all fields to FormData
  Object.keys(payload).forEach(key => {
    const value = payload[key];
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const response = await api.post('/counselors/apply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getRecommendedCounselors = async (): Promise<any[]> => {
  const response = await api.get('/counselors/recommendations/me');
  return response.data || [];
};

export const getCounselors = async (params?: any): Promise<{ rows: any[], count: number }> => {
  const response = await api.get('/counselors/directory', { params });
  return response.data;
};

export const createBooking = async (slotId: number) => {
  const response = await api.post('/counselors/bookings', { slotId });
  return response.data;
};

export const initiateBooking = async (studentUserId: number, slotId: number) => {
  const response = await api.post('/counselors/initiate-booking', { studentUserId, slotId });
  return response.data;
};

export const getMyWalletLedger = async () => {
  const response = await api.get('/counselors/me/wallet/ledger');
  return response.data;
};

export const requestPayout = async (payload: {
  amount: number;
  payoutMethod: 'bank_transfer' | 'fana' | 'telebirr';
  payoutDetails: any;
}) => {
  const response = await api.post('/counselors/me/payouts/request', payload);
  return response.data;
};

export const reviewAndConfirmBooking = async (bookingId: number, payload: { rating: number; comment?: string }) => {
  const response = await api.post(`/counselors/bookings/${bookingId}/review-confirm`, payload);
  return response.data;
};

