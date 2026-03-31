"use client";

import { Message, ChatUser } from "../types";
import { format } from "date-fns";
import { User, CheckCheck } from "lucide-react";

interface ChatWindowProps {
  messages: Message[];
  currentUserId: number;
  otherUser: ChatUser | null;
  loading: boolean;
  typingUser: { userId: number; isTyping: boolean } | null;
}

export const ChatWindow = ({ messages, currentUserId, otherUser, loading, typingUser }: ChatWindowProps) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-card/10 overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground leading-none">
              {otherUser?.name || 'Select a conversation'}
            </h3>
            <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
              {otherUser?.role || 'Messenger'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className={`h-2.5 w-2.5 rounded-full ${otherUser ? 'bg-emerald-500' : 'bg-muted'}`} />
           <span className="text-xs text-muted-foreground">{otherUser ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-6">
        {loading ? (
          <div className="flex justify-center py-10 opacity-50">
            <span className="text-xs">Loading message history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center py-20 text-muted-foreground text-sm italic">
             No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((m, idx) => {
            const isMe = m.senderId === currentUserId;
            return (
              <div 
                key={m.id || idx}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[80%]">
                  {!isMe && (
                    <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] mb-1">
                      <User className="h-3 w-3" />
                    </div>
                  )}
                  <div 
                    className={`p-3.5 rounded-[1.2rem] text-sm  ${isMe ? 'primary-gradient text-primary-foreground rounded-tr-none' : 'bg-card border border-border text-foreground rounded-tl-none'}`}
                  >
                    {m.content.match(/^\[Attached File\]\((.*?)\)$/) ? (
                      <a 
                        href={m.content.match(/^\[Attached File\]\((.*?)\)$/)![1]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 underline hover:opacity-80"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        View Attachment
                      </a>
                    ) : (
                      <span className="whitespace-pre-wrap word-break break-words">
                        {m.content}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={`flex items-center gap-2 mt-1.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] text-muted-foreground/60 font-medium">
                        {format(new Date(m.createdAt), "hh:mm a")}
                    </span>
                    {isMe && (
                       <CheckCheck className={`h-3 w-3 ${m.isRead ? 'text-primary' : 'text-muted-foreground/40'}`} />
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Typing Indicator */}
      {typingUser && typingUser.isTyping && typingUser.userId !== currentUserId && (
          <div className="absolute bottom-20 left-6 flex items-center gap-2 text-[11px] text-muted-foreground bg-card/80 border border-border px-3 py-1.5 rounded-full backdrop-blur-sm">
             <div className="flex gap-1">
                <span className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1 w-1 bg-primary rounded-full animate-bounce" />
             </div>
             {otherUser?.name} is typing...
          </div>
      )}
    </div>
  );
};
