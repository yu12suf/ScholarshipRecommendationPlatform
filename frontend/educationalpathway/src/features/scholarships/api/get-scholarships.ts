import api from '@/lib/api';
import { Scholarship, ScholarshipFilters } from '../types';

const mapScholarship = (item: any): Scholarship => ({
  ...item,
  matchScore: item.matchScore || item.match_score,
  matchReason: item.matchReason || item.match_reason,
});

export const getScholarships = async (filters?: ScholarshipFilters): Promise<Scholarship[]> => {
  const response = await api.get('/scholarships/match', { params: filters });
  return (response.data || []).map(mapScholarship);
};

export const exploreScholarships = async (filters?: ScholarshipFilters): Promise<Scholarship[]> => {
  const response = await api.get('/scholarships', { params: filters });
  // The list response might have a different structure { status: 'success', data: [...] }
  const data = response.data.status === 'success' ? response.data.data : response.data;
  return (data || []).map(mapScholarship);
};

export const getScholarship = async (id: string | number): Promise<Scholarship> => {
  const response = await api.get(`/scholarships/${id}`);
  return mapScholarship(response.data);
};

export const getRecommendedScholarships = async (): Promise<Scholarship[]> => {
  const response = await api.get('/scholarships/recommendations');
  return (response.data || []).map(mapScholarship);
};

export const getDashboardStats = async () => {
  const response = await api.get('/scholarships/dashboard/stats');
  return response.data;
};
