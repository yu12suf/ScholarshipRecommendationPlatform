"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { ChatList } from "./components/ChatList";
import { ChatWindow } from "./components/ChatWindow";
import { ChatInput } from "./components/ChatInput";
import { Conversation, Message, ChatUser } from "./types";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const ChatPage = ({ currentUser }: { currentUser: ChatUser }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingStatus, setTypingStatus] = useState<{ userId: number; isTyping: boolean } | null>(null);

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
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/chat/${activeConversation.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.data);
        
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
        return prev.map((conv) => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              chatMessages: [message, ...(conv.chatMessages || conv.messages || conv.ChatMessages || [])],
              updatedAt: new Date().toISOString()
            };
          }
          return conv;
        }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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

  return (
    <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden bg-background rounded-sm shadow-2xl border border-border mt-4">
      {/* Sidebar */}
      <div className="w-80 h-full border-r border-border shrink-0">
        <ChatList
          conversations={conversations}
          activeConversationId={activeConversation?.id || null}
          onSelect={setActiveConversation}
          currentUserId={currentUser.id}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <ChatWindow
          messages={messages}
          currentUserId={currentUser.id}
          otherUser={otherUser}
          loading={loading}
          typingUser={typingStatus}
        />
        
        <ChatInput 
          onSend={handleSendMessage}
          onTyping={handleTyping}
          disabled={!activeConversation}
        />
      </div>
    </div>
  );
};
