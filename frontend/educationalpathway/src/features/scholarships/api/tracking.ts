import api from "@/lib/api";

export const trackScholarship = async (scholarshipId: number) => {
  const response = await api.post(`/scholarships/track/${scholarshipId}`);
  return response.data;
};

export const untrackScholarship = async (scholarshipId: number) => {
  const response = await api.delete(`/scholarships/track/${scholarshipId}`);
  return response.data;
};

export const getTrackedScholarships = async () => {
  const response = await api.get("/scholarships/tracked");
  return response.data;
};

export const updateScholarshipStatus = async (trackingId: number, status: string) => {
  const response = await api.patch(`/scholarships/track/status/${trackingId}`, { status });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get("/scholarships/dashboard/stats");
  return response.data;
};
