'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  ForgotPasswordData, 
  ResetPasswordData 
} from '@/features/auth/types';
import * as authApi from '@/features/auth/api/auth-api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { user, accessToken } = await authApi.login(credentials);

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      
      if (!user.isOnboarded) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      throw error;
    }
  };

  const googleLogin = async (credential: string) => {
    try {
      const { user, accessToken } = await authApi.googleLogin(credential);

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      
      if (!user.isOnboarded) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const { user, accessToken } = await authApi.register(data);

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      router.push('/onboarding');
    } catch (error: unknown) {
      throw error;
    }
  };

  const forgotPassword = async (data: ForgotPasswordData) => {
    try {
      await authApi.forgotPassword(data);
    } catch (error: unknown) {
      throw error;
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      await authApi.resetPassword(data);
      router.push('/login');
    } catch (error: unknown) {
      throw error;
    }
  };

  const logout = () => {
    authApi.logout().catch(console.error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, forgotPassword, resetPassword, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
