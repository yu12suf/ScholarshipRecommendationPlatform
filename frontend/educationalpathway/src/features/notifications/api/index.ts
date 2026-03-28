import api from "@/lib/api";
import { Notification } from "../types";

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get("/notifications");
  // Handle different response structures if necessary
  return response.data.data || response.data;
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

export const markNotificationAsClicked = async (id: number): Promise<void> => {
  await api.patch(`/notifications/${id}/click`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch("/notifications/read-all");
};

export const updateFCMToken = async (token: string): Promise<void> => {
  await api.post("/notifications/token", { token, fcmToken: token });
};
