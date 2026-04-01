"use client";

import { useAuth } from "@/providers/auth-context";
import { ChatPage } from "@/features/chat/ChatPage";
import { Loader2 } from "lucide-react";

export default function CounselorChatPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="h2">Student Communications</h1>
        <p className="text-body text-muted-foreground">
          Real-time updates and support for your assigned students.
        </p>
      </div>

      <ChatPage currentUser={{ id: user.id, name: user.name, role: user.role }} />
    </div>
  );
}
