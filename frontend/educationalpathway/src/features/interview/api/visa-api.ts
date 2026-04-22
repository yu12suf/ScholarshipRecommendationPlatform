import api from "@/lib/api";

export const getVisaGuidelines = async (country: string) => {
  const response = await api.get(`/visa/guidelines/${country}`);
  return response.data;
};

export const initiateVisaCall = async (studentInfo: {
  country: string;
  university?: string;
}) => {
  const response = await api.post("/visa/initiate-call", studentInfo);
  return response.data;
};

export const getVisaInterviewAnalysis = async (interviewId: string) => {
  const response = await api.get(`/visa/analysis/${interviewId}`);
  return response.data;
};

export const finalizeVisaInterview = async (interviewId: string, transcript: any[]) => {
  const response = await api.post(`/visa/finalize/${interviewId}`, { transcript });
  return response.data;
};

export const transcribeAudio = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  
  const response = await api.post("/visa/transcribe", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const chatResponse = async (messages: any[]) => {
  const response = await api.post("/visa/chat", { messages });
  return response.data;
};

