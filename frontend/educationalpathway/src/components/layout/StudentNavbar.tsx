"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-context";
import { Bell, LogOut, GraduationCap, ChevronDown, User as UserIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export function StudentNavbar() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-gray-200 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/dashboard/student"
          className="flex items-center gap-3"
        >
          <div className="p-2 bg-blue-600 rounded-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>

          <span className="text-lg font-semibold text-gray-900">
            EduPathway
          </span>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8">

          <Link
            href="/dashboard/student"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/scholarships"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Scholarships
          </Link>

          <Link
            href="/dashboard/counselors"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            Counselors
          </Link>

          <Link
            href="/dashboard/assessment"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
          >
            learn
          </Link>

        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3  cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0) || "Y"}
              </div>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 overflow-hidden"
                >
                  <Link
                    href="/dashboard/student/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <UserIcon className="h-4 w-4" />
                    My Profile
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </nav>
  );
}