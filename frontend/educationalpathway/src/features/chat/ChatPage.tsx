"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { ChatList } from "./components/ChatList";
import { ChatWindow } from "./components/ChatWindow";
import { ChatInput } from "./components/ChatInput";
import { Conversation, Message, ChatUser } from "./types";
import axios from "axios";
import { toast } from "react-hot-toast";
import { BookingModal } from "../counselor/components/BookingModal";
import { StudentBookingModal } from "../counselor/components/StudentBookingModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const ChatPage = ({ currentUser }: { currentUser: ChatUser }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingStatus, setTypingStatus] = useState<{ userId: number; isTyping: boolean } | null>(null);
  
  // Booking States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeCounselorData, setActiveCounselorData] = useState<any>(null);
  const [fetchingCounselor, setFetchingCounselor] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
  const { socket, isConnected } = useSocket(token);

  // 1. Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data.data);
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      }
    };
    if (token) fetchConversations();
  }, [token]);

  // 2. Fetch Messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) return;

      // Update conversations list locally to reset unread count
      setConversations(prev => prev.map(c =>
        c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c
      ));

      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/chat/${activeConversation.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.data);

        // Mark as read on server
        axios.patch(`${API_BASE_URL}/chat/read/${activeConversation.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Join socket room
        if (socket) {
          socket.emit("join_conversation", activeConversation.id);
        }
      } catch (err) {
        console.error("Failed to fetch messages", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [activeConversation, token, socket]);

  // 3. Socket Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (message: Message) => {
      if (activeConversation && message.conversationId === activeConversation.id) {
        setMessages((prev) => [message, ...prev]);
        // Auto-mark as read? Or just refresh if in window
        axios.patch(`${API_BASE_URL}/chat/read/${activeConversation.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Update conversations list for snippet
      setConversations((prev) => {
        const index = prev.findIndex((conv) => conv.id === message.conversationId);

        if (index === -1) {
          // If conversation isn't in sidebar yet (e.g. brand new), we can't update it easily
          // unless we trigger a refresh of conversations from API.
          // For now, let's just make it possible to fetch them or assume usual case.
          return prev;
        }

        const newConversations = [...prev];
        const conv = newConversations[index];
        const isCurrentlyViewed = activeConversation?.id === conv.id;

        const currentCount = typeof conv.unreadCount === 'string' ? parseInt(conv.unreadCount, 10) : (conv.unreadCount || 0);

        newConversations[index] = {
          ...conv,
          chatMessages: [message, ...(conv.chatMessages || conv.messages || conv.ChatMessages || [])],
          updatedAt: new Date().toISOString(),
          unreadCount: isCurrentlyViewed ? 0 : currentCount + 1
        };

        return newConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    });

    socket.on("user_typing", (data: { userId: number; isTyping: boolean }) => {
      setTypingStatus(data);
    });

    socket.on("new_message_alert", (data: { conversationId: number; senderName: string; content: string }) => {
      if (!activeConversation || activeConversation.id !== data.conversationId) {
        toast(`${data.senderName}: ${data.content}`, {
          icon: '💬',
          position: 'bottom-right'
        });
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("new_message_alert");
    };
  }, [socket, activeConversation, token]);

  const handleSendMessage = useCallback((content: string) => {
    if (!activeConversation || !socket) return;
    const otherUser = activeConversation.users?.find(u => u.id !== currentUser.id);
    if (!otherUser) return;

    socket.emit("send_message", {
      conversationId: activeConversation.id,
      receiverId: otherUser.id,
      content
    });
  }, [activeConversation, socket, currentUser.id]);

  const handleTyping = useCallback((isTyping: boolean) => {
    if (!activeConversation || !socket) return;
    socket.emit("typing", {
      conversationId: activeConversation.id,
      isTyping
    });
  }, [activeConversation, socket]);

  const otherUser = activeConversation?.users?.find(u => u.id !== currentUser.id) || null;

  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenNewChat = async () => {
    setIsModalOpen(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/available-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableUsers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch available users", err);
    }
  };

  const handleStartChat = async (userId: number) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/chat/start`, { receiverId: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newConv = res.data.data;
      setConversations(prev => {
        const exists = prev.find(c => c.id === newConv.id);
        if (exists) return prev;
        return [newConv, ...prev];
      });
      setActiveConversation(newConv);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to start chat", err);
      toast.error("Failed to start chat");
    }
  };

  const handleOpenBooking = async () => {
    if (!otherUser) return;
    
    if (currentUser.role === 'counselor') {
      // Counselor mode: otherUser is the student
      setActiveCounselorData({ 
        id: -1, // Placeholder as we use /counselors/slots anyway
        name: currentUser.name 
      });
      setIsBookingModalOpen(true);
    } else if (otherUser.role === 'counselor') {
      // Student mode: otherUser is the counselor
      setFetchingCounselor(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/counselors/by-user/${otherUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActiveCounselorData(res.data.data);
        setIsBookingModalOpen(true);
      } catch (err) {
        console.error("Failed to fetch counselor data", err);
        toast.error("Could not fetch counselor details");
      } finally {
        setFetchingCounselor(false);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden bg-background rounded-lg border border-border mt-4 relative">
      {/* Sidebar */}
      <div className="w-80 h-full border-r border-border shrink-0">
        <ChatList
          conversations={conversations}
          activeConversationId={activeConversation?.id || null}
          onSelect={setActiveConversation}
          currentUserId={currentUser.id}
          currentUserRole={currentUser.role}
          onNewChat={handleOpenNewChat}
          onBookSession={async (userId) => {
            if (currentUser.role === 'counselor') {
              setActiveCounselorData({ id: -1, name: currentUser.name });
              setIsBookingModalOpen(true);
            } else {
              setFetchingCounselor(true);
              try {
                const res = await axios.get(`${API_BASE_URL}/counselors/by-user/${userId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                setActiveCounselorData(res.data.data);
                setIsBookingModalOpen(true);
              } catch (err) {
                toast.error("Could not fetch counselor details");
              } finally {
                setFetchingCounselor(false);
              }
            }
          }}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeConversation ? (
          <>
            <ChatWindow
              messages={messages}
              currentUserId={currentUser.id}
              otherUser={otherUser}
              loading={loading}
              typingUser={typingStatus}
              currentUserRole={currentUser.role}
              onBookSession={handleOpenBooking}
              bookingLoading={fetchingCounselor}
            />

            <ChatInput
              onSend={handleSendMessage}
              onTyping={handleTyping}
              onSchedule={handleOpenBooking}
              disabled={!activeConversation}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation or start a new chat.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card w-full max-w-md rounded-lg p-6 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">New Chat</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {availableUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No users available.</p>
              ) : (
                availableUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted transition-colors cursor-pointer" onClick={() => handleStartChat(user.id)}>
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-xs text-muted-foreground uppercase">{user.role}</div>
                    </div>
                    <button className="text-primary text-sm font-medium">Chat</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {isBookingModalOpen && activeCounselorData && (
        currentUser.role === 'counselor' ? (
          <BookingModal
            counselor={activeCounselorData}
            studentUserId={otherUser?.id}
            onClose={() => setIsBookingModalOpen(false)}
          />
        ) : (
          <StudentBookingModal
            counselor={activeCounselorData}
            onClose={() => setIsBookingModalOpen(false)}
          />
        )
      )}
    </div>
  );
};
