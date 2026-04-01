"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image, MoreHorizontal, Smile, Paperclip } from "lucide-react";
import { Button } from "@/components/ui";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ChatInputProps {
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, onTyping, disabled }: ChatInputProps) => {
  const [content, setContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;

    const toastId = toast.loading("Uploading attachment...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
      const res = await axios.post(`${API_BASE_URL}/chat/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      const fileUrl = res.data.data.url;
      // Immediately send as attachment
      onSend(`[Attached File](${fileUrl})`);
      toast.success("File attached and sent!", { id: toastId });
    } catch (err) {
      toast.error("Failed to upload file", { id: toastId });
      console.error("Upload error:", err);
    }
    
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;
    onSend(content.trim());
    setContent("");
    onTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onTyping(true);

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      onTyping(false);
    }, 3000);
  };

  return (
    <div className="p-4 bg-card border-t border-border flex items-center gap-3 relative">
      {showEmoji && (
        <div ref={emojiRef} className="absolute bottom-20 left-4 z-50 rounded-lg overflow-hidden border border-border">
          <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.AUTO} lazyLoadEmojis={true} />
        </div>
      )}

      <div className="flex items-center gap-2 pr-2 border-r border-border shrink-0">
        <button 
            type="button" 
            onClick={() => setShowEmoji((prev) => !prev)}
            disabled={disabled}
            className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer disabled:opacity-50">
          <Smile className="h-5 w-5" />
        </button>

        <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden" 
        />
        <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer disabled:opacity-50">
          <Paperclip className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-3">
        <div className="relative flex-1">
          <textarea
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            disabled={disabled}
            placeholder="Type a message..."
            className="w-full bg-muted border-none rounded-[1.2rem] px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 resize-none max-h-32 min-h-[44px] scrollbar-hide"
            rows={1}
          />
        </div>

        <button
          type="submit"
          disabled={!content.trim() || disabled}
          className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${!content.trim() || disabled ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'primary-gradient text-white  shadow-primary/20 hover:scale-105 active:scale-95 cursor-pointer'}`}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};
