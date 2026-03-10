import api from '@/lib/api';
import { User, UserRole } from '@/features/auth/types';

export const getAllUsers = async (page = 1, limit = 10): Promise<User[]> => {
  const response = await api.get('/user', { params: { page, limit } });
  return response.data;
};

export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  const response = await api.get(`/user/role/${role}`);
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get(`/user/${id}`);
  return response.data;
};

export const updateUserRole = async (id: number, role: UserRole): Promise<User> => {
  const response = await api.put(`/user/${id}/role`, { role });
  return response.data;
};

export const deactivateUser = async (id: number): Promise<void> => {
  await api.put(`/user/${id}/deactivate`);
};

export const activateUser = async (id: number): Promise<void> => {
  await api.put(`/user/${id}/activate`);
};
