import api from '@/lib/api';

export interface AssessmentOptions {
  examType: string;
  difficulty: string;
}

export const generateAssessment = async (options: AssessmentOptions) => {
  const response = await api.post('/assessment/generate', options);
  return response.data;
};

export const submitAssessment = async (testId: string, responses: unknown, audio?: Blob) => {
  if (audio) {
    // Multipart form with audio file
    const formData = new FormData();
    formData.append('test_id', testId);
    formData.append('responses', JSON.stringify(responses));
    formData.append('audio', audio, 'recording.webm');

    const response = await api.post('/assessment/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // JSON body when no audio (avoids multipart parsing overhead)
  const response = await api.post('/assessment/submit', {
    test_id: testId,
    responses,
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

export const getLearningPath = async () => {
    const response = await api.get('/learning-path/my-path');
    return response.data;
};

export const trackProgress = async (videoId: number, section: string, isCompleted: boolean = true) => {
    const response = await api.post('/learning-path/track', { videoId, section, isCompleted });
    return response.data;
};
