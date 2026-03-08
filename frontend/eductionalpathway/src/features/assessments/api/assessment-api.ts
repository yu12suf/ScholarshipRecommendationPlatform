import api from '@/lib/api';

export interface AssessmentOptions {
  examType: string;
  difficulty: string;
}

export const generateAssessment = async (options: AssessmentOptions) => {
  const response = await api.post('/assessment/generate', options);
  return response.data;
};

export const submitAssessment = async (testId: string, responses: any, audio?: Blob) => {
  const formData = new FormData();
  formData.append('test_id', testId);
  formData.append('responses', JSON.stringify(responses));
  if (audio) {
    formData.append('audio', audio, 'recording.webm');
  }

  const response = await api.post('/assessment/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getAssessmentResult = async (testId: string) => {
  const response = await api.get(`/assessment/result/${testId}`);
  return response.data;
};

export const getAssessmentProgress = async (examType?: string) => {
  const response = await api.get('/assessment/progress', { params: { examType } });
  return response.data;
};
