export interface ChatUser {
  id: number;
  name: string;
  role: string;
  email?: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: ChatUser;
}

export interface Conversation {
  id: number;
  createdAt: string;
  updatedAt: string;
  users: ChatUser[];
  chatMessages?: Message[];
  messages?: Message[];
  ChatMessages?: Message[];
  unreadCount?: number;
}
