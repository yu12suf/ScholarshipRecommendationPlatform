import api from '@/lib/api';
import { ExtractedData, StudentExtractedData } from '../types';

export const extractData = async (document: File, role: string) => {
  const formData = new FormData();
  formData.append('document', document);
  formData.append('role', role);

  const response = await api.post('/onboarding/extract', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.extractedData as ExtractedData;
};

export interface ExtractProfileResponse {
  extractedData: StudentExtractedData;
  profileFormValues: Record<string, any>;
  confidence: number;
  extractedFields: number;
  success?: boolean;
}

export const extractProfileFromDocument = async (document: File): Promise<ExtractProfileResponse> => {
  const formData = new FormData();
  formData.append('document', document);

  const response = await api.post('/onboarding/extract-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data as ExtractProfileResponse;
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
  const formData = new FormData();
  
  // Append all non-file fields to FormData
  Object.keys(payload).forEach(key => {
    if (key === 'documents') return; // Handle documents separately
    
    const value = payload[key];
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  // Append documents correctly
  if (payload.documents) {
    Object.keys(payload.documents).forEach(docKey => {
      const file = payload.documents[docKey];
      if (file instanceof File) {
        formData.append(docKey, file);
      }
    });
  }

  const response = await api.put('/onboarding/update-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
