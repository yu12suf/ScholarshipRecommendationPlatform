import api from '@/lib/api';
import { Scholarship, ScholarshipFilters } from '../types';

export const getScholarships = async (filters?: ScholarshipFilters): Promise<Scholarship[]> => {
  const response = await api.get('/scholarships/match', { params: filters });
  return response.data;
};

export const getScholarship = async (id: string | number): Promise<Scholarship> => {
  const response = await api.get(`/scholarships/${id}`);
  return response.data;
};

export const getRecommendedScholarships = async (): Promise<Scholarship[]> => {
  const response = await api.get('/scholarships/recommendations');
  return response.data;
};
