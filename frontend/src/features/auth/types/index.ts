export type UserRole = 'student' | 'counselor' | 'admin';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  isOnboarded: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password?: string;
}
