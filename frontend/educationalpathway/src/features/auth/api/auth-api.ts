import api from '@/lib/api';
import { 
  LoginCredentials, 
  RegisterData, 
  ForgotPasswordData, 
  ResetPasswordData,
  AuthResponse
} from '../types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const googleLogin = async (credential: string, role?: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/google-login', { credential, role });
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const forgotPassword = async (data: ForgotPasswordData): Promise<void> => {
  await api.post('/auth/forgot-password', data);
};

export const resetPassword = async (data: ResetPasswordData): Promise<void> => {
  await api.post('/auth/reset-password', data);
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const refreshToken = async (): Promise<{ accessToken: string }> => {
  const response = await api.post('/auth/refresh-token');
  return response.data;
};

export const getMe = async (): Promise<any> => {
  const response = await api.get('/auth/me');
  return response.data;
};
