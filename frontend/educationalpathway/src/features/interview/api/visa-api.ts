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

export const getVisaInterviewAnalysis = async (interviewId: string, forceSync: boolean = true) => {
  const response = await api.get(`/visa/analysis/${interviewId}?forceSync=${forceSync}`);
  return response.data;
};

export const finalizeVisaInterview = async (interviewId: string) => {
  const response = await api.post(`/visa/finalize/${interviewId}`);
  return response.data;
};
