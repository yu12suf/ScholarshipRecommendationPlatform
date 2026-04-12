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

export interface AvailabilitySlot {
  id: number;
  counselorId: number;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked';
  meetingLink?: string;
  consultationMode?: string;
}

export interface BookingRequest {
  slotId: number;
  notes?: string;
}

export interface BookingConfirmation {
  id: number;
  status: string;
  meetingLink: string;
  slot: {
    startTime: string;
    endTime: string;
    consultationMode: string;
  };
  counselor: {
    name: string;
    email: string;
  };
  student: {
    name: string;
  };
}

export interface StudentBooking extends BookingConfirmation {
  studentId: number;
  counselorId: number;
  slotId: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  counselor?: {
    name: string;
    email: string;
    userId?: number;
  };
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
  return response.data; // Returns { success: true, data: [...] }
};

export const getCounselorSlotsById = async (counselorId: number): Promise<AvailabilitySlot[]> => {
  const response = await api.get(`/counselors/slots/public/${counselorId}`);
  // Handle both { success: true, data: [...] } and [...] responses
  if (response.data?.data) return response.data.data;
  if (Array.isArray(response.data)) return response.data;
  return [];
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

export const bookSession = async (bookingData: BookingRequest): Promise<BookingConfirmation> => {
  const response = await api.post('/counselors/bookings', bookingData);
  return response.data;
};

export const getRecommendedCounselors = async (): Promise<any[]> => {
  try {
    const response = await api.get('/counselors/recommendations/me');
    console.log('[counselor-api] Full response:', response);
    console.log('[counselor-api] response.data:', response.data);
    console.log('[counselor-api] response.data.data:', response.data?.data);
    
    const data = response.data?.data;
    if (data && Array.isArray(data)) {
      return data;
    }
    
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('[counselor-api] Error:', error);
    throw error;
  }
};

export const getMyBookings = async (): Promise<{ success: boolean; data: StudentBooking[] }> => {
  const response = await api.get('/counselors/my-bookings');
  return response.data;
};

export const getMyUpcomingBookings = async (): Promise<{ success: boolean; data: StudentBooking[] }> => {
  const response = await api.get('/counselors/my-bookings/upcoming');
  return response.data;
};

export const getBookingDetails = async (bookingId: number): Promise<{ success: boolean; data: StudentBooking }> => {
  const response = await api.get(`/counselors/my-bookings/${bookingId}`);
  return response.data;
};

export const getBookingThread = async (bookingId: number): Promise<{ success: boolean; data: any[] }> => {
  const response = await api.get(`/counselors/my-bookings/${bookingId}/thread`);
  return response.data;
};

export const joinSession = async (bookingId: number): Promise<{ success: boolean; data: { meetingLink: string } }> => {
  const response = await api.post(`/counselors/bookings/${bookingId}/join`);
  return response.data;
};

export interface SendMessageRequest {
  receiverId: number;
  body: string;
}

export const sendBookingMessage = async (bookingId: number, data: SendMessageRequest): Promise<{ success: boolean; data: any }> => {
  const response = await api.post('/counselors/messages', {
    recipientUserId: data.receiverId,
    body: data.body
  });
  return response.data;
};
