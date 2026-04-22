"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-context";
import {
  Search,
  Bell,
  Menu,
  X,
  GraduationCap,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  BookOpen,
  Globe,
  ChevronDown,
  UserCircle,
  HelpCircle,
  Moon,
  Sun,
} from "lucide-react";
import { Input, Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface NavLink {
  name: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

interface NavbarProps {
  simplified?: boolean;
}

export function Navbar({ simplified = false }: NavbarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const getNavLinks = (): NavLink[] => {
    const baseLinks = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Overview & analytics",
      },
      {
        name: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        description: "Manage preferences",
      },
    ];

    if (user?.role === "student") {
      return [
        {
          name: "Dashboard",
          href: "/dashboard/student",
          icon: LayoutDashboard,
          description: "Your activity",
        },
        {
          name: "Scholarships",
          href: "/dashboard/scholarships",
          icon: GraduationCap,
          description: "Find opportunities",
        },
        {
          name: "Counselors",
          href: "/dashboard/counselors",
          icon: Users,
          description: "Get expert guidance",
        },
        {
          name: "Settings",
          href: "/dashboard/settings",
          icon: Settings,
          description: "Account settings",
        },
      ];
    }

    if (user?.role === "counselor") {
      return [
        {
          name: "Dashboard",
          href: "/dashboard/counselor",
          icon: LayoutDashboard,
          description: "Your overview",
        },
        {
          name: "My Students",
          href: "/dashboard/students",
          icon: Users,
          description: "Manage students",
        },
        {
          name: "Resources",
          href: "/dashboard/resources",
          icon: BookOpen,
          description: "Guidance materials",
        },
        {
          name: "Settings",
          href: "/dashboard/settings",
          icon: Settings,
          description: "Preferences",
        },
      ];
    }

    if (user?.role === "admin") {
      return [
        {
          name: "Dashboard",
          href: "/dashboard/admin",
          icon: LayoutDashboard,
          description: "Platform overview",
        },
        {
          name: "Users",
          href: "/dashboard/users",
          icon: Users,
          description: "Manage users",
        },
        {
          name: "Analytics",
          href: "/dashboard/analytics",
          icon: Globe,
          description: "Platform insights",
        },
        {
          name: "Settings",
          href: "/dashboard/settings",
          icon: Settings,
          description: "System settings",
        },
      ];
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();

  const getInitials = (name: string = "User") => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log("Searching for:", searchQuery);
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className={`sticky top-0 z-40 w-full bg-white border-b border-gray-200  ${simplified ? 'h-16' : ''}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative overflow-hidden rounded-lg">
                  <Image 
                    src="/admas.png" 
                    alt="አድማስ Logo" 
                    width={32} 
                    height={32} 
                    className="h-8 w-8 object-contain"
                  />
                </div>
              </div>
              <span className="text-xl font-semibold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent hidden sm:block">
                አድማስ
              </span>
            </Link>

            {/* Desktop Navigation */}
            {!simplified && (
              <div className="hidden lg:flex items-center ml-8">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`relative px-4 py-2 text-sm font-medium transition-colors group`}
                    >
                      <span
                        className={`${isActive ? "text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
                      >
                        {link.name}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-active"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Search scholarships, counselors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchOpen(true)}
                    className="w-64 h-9 pl-9 pr-4 text-sm bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </form>

              <AnimatePresence>
                {isSearchOpen && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer">
                        Search results for &quot;{searchQuery}&quot;
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            {!simplified && (
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 p-0 rounded-full hover:bg-gray-100 hidden sm:inline-flex"
              >
                <Bell className="h-4 w-4 text-gray-600" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
              </Button>
            )}

            {/* Theme Toggle */}
            {!simplified && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="h-9 w-9 p-0 rounded-full hover:bg-gray-100 hidden sm:inline-flex"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 text-gray-600" />
                ) : (
                  <Moon className="h-4 w-4 text-gray-600" />
                )}
              </Button>
            )}

            {/* Divider */}
            {!simplified && <div className="h-8 w-px bg-gray-200 hidden sm:block" />}

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="h-9 w-9 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                  {getInitials(user?.name)}
                </div>
                {!simplified && (
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-700">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role}
                    </p>
                  </div>
                )}
                {!simplified && (
                  <ChevronDown
                    className={`hidden lg:block h-4 w-4 text-gray-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 mt-2 w-72 origin-top-right"
                    >
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* User Info */}
                        <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-semibold">
                              {getInitials(user?.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {user?.name || "User"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {user?.email}
                              </p>
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-white text-blue-700 rounded-full border border-blue-200">
                                {user?.role}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Links */}
                        <div className="p-2 border-b border-gray-100">
                          <Link
                            href={user?.role === 'counselor' ? '/dashboard/counselor/profile' : '/dashboard/student/profile'}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <UserCircle className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">My Profile</p>
                              <p className="text-xs text-gray-500">
                                View and edit your profile
                              </p>
                            </div>
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">Settings</p>
                              <p className="text-xs text-gray-500">
                                Account preferences
                              </p>
                            </div>
                          </Link>
                          <Link
                            href="/help"
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <HelpCircle className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">Help & Support</p>
                              <p className="text-xs text-gray-500">
                                Get help with your account
                              </p>
                            </div>
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="p-2">
                          <button
                            onClick={() => {
                              logout();
                              setIsProfileOpen(false);
                            }}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut className="h-5 w-5" />
                            <div className="text-left">
                              <p className="font-medium">Sign Out</p>
                              <p className="text-xs text-gray-500">
                                Log out of your account
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            {!simplified && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden h-9 w-9 p-0 rounded-lg hover:bg-gray-100"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {!simplified && (
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-gray-200 bg-white overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 bg-gray-50 border-gray-200"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </form>

                {/* Mobile Navigation Links */}
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-400"}`}
                      />
                      <div>
                        <p className="font-medium">{link.name}</p>
                        {link.description && (
                          <p className="text-xs text-gray-500">
                            {link.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}

                {/* Mobile Divider */}
                <div className="my-3 border-t border-gray-100" />

                {/* Mobile User Info */}
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                {/* Mobile Logout */}
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </nav>
  );
}
