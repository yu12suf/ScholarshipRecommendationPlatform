"use client";

import { Conversation } from "../types";
import { formatDistanceToNow } from "date-fns";
import { User, MessageCircle } from "lucide-react";

interface ChatListProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelect: (conversation: Conversation) => void;
  currentUserId: number;
}

export const ChatList = ({ conversations, activeConversationId, onSelect, currentUserId }: ChatListProps) => {
  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Conversations</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No active conversations.
          </div>
        ) : (
          conversations.map((conv) => {
            const otherUser = conv.users?.find(u => u.id !== currentUserId);
            const lastMessage = conv.chatMessages?.[0] || conv.messages?.[0] || conv.ChatMessages?.[0];
            const isActive = activeConversationId === conv.id;

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`w-full p-4 flex items-center gap-3 transition-colors hover:bg-muted ${isActive ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="h-5 w-5" />
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm truncate">{otherUser?.name || 'Unknown User'}</span>
                    {lastMessage && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                      {otherUser?.role}
                    </span>
                    {lastMessage && (
                      <p className="text-xs text-muted-foreground truncate flex-1">
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
