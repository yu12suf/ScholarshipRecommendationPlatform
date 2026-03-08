import api from '@/lib/api';
import { ExtractedData } from '../types';

export const extractData = async (document: File, role: string) => {
  const formData = new FormData();
  formData.append('document', document);
  formData.append('role', role);

  const response = await api.post('/onboarding/extract', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.extractedData as ExtractedData;
};

export const verifyIdentity = async (idCard: File, selfie: File) => {
  const formData = new FormData();
  formData.append('idCard', idCard);
  formData.append('selfie', selfie);

  const response = await api.post('/onboarding/verify-identity', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateProfile = async (payload: any) => {
  const response = await api.put('/onboarding/update-profile', payload);
  return response.data;
};
