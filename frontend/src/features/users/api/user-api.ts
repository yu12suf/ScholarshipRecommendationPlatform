import api from '@/lib/api';
import { User } from '@/types/user';

export const getProfile = async (): Promise<User> => {
  const response = await api.get('/user/profile');
  return response.data;
};

export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await api.put('/user/profile', data);
  return response.data;
};

// Admin APIs could go here too or in a separate admin feature
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/user');
  return response.data;
};

// Fetch profile completion status and percentage
export interface ProfileCompletionData {
  completionPercentage: number;
  status: 'completed' | 'incomplete';
  message: string;
}

export const getProfileCompletion = async (): Promise<ProfileCompletionData> => {
  const response = await api.get('/user/profile/completion');
  return response.data;
};
