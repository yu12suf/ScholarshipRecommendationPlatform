"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Info,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { NotificationType } from "../types";
import { useNotifications } from "../hooks/useNotifications";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAsClicked, markAllAsRead } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
  };

  const handleMarkAsClicked = async (id: number) => {
    await markAsClicked(id);
    setIsOpen(false);
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case "SCHOLARSHIP_MATCH":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "ASSESSMENT_COMPLETE":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "COUNSELOR_MESSAGE":
        return <MessageSquare className="h-4 w-4 text-primary" />;
      default:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 md:w-96 bg-card border border-border rounded-lg z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <Bell className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No notifications yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() =>
                        !notification.isRead &&
                        handleMarkAsRead(notification.id)
                      }
                      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3 ${!notification.isRead ? "bg-primary/5" : ""}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {getIconForType(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm leading-tight ${!notification.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}
                          >
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true },
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        {notification.type === "SCHOLARSHIP_MATCH" &&
                          notification.relatedId && (
                            <Link
                              href={`/dashboard/student/scholarships/${notification.relatedId}`}
                              onClick={() => handleMarkAsClicked(notification.id)}
                              className="text-[10px] font-bold text-primary hover:underline inline-block mt-1"
                            >
                              View Scholarship →
                            </Link>
                          )}
                      </div>
                      {!notification.isRead && (
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border bg-muted/30 text-center">
              <button
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
