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

export const trackProgress = async (params: { videoId?: number; questionIndex?: number; isNote?: boolean; section: string; isCompleted?: boolean }) => {
    const { videoId, questionIndex, isNote, section, isCompleted = true } = params;
    const response = await api.post('/learning-path/track', { videoId, questionIndex, isNote, section, isCompleted });
    return response.data;
};

export const completeSection = async (section: string) => {
    const response = await api.post('/learning-path/complete-section', { section });
    return response.data;
};

export const evaluateSpeakingPractice = async (questionIndex: number, audio: Blob) => {
    const formData = new FormData();
    formData.append('questionIndex', questionIndex.toString());
    formData.append('audio', audio, 'practice_recording.webm');

    const response = await api.post('/learning-path/speaking/evaluate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};
