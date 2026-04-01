export type NotificationType = 'SCHOLARSHIP_MATCH' | 'ASSESSMENT_COMPLETE' | 'COUNSELOR_MESSAGE' | 'SYSTEM_UPDATE';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
