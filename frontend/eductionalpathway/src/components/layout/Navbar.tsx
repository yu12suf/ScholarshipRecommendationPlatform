'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-context';
import { 
  Search, 
  Bell, 
  Menu, 
  X, 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { Input, Button } from '@/components/ui';

export function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getNavLinks = () => {
    const baseLinks = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];
    
    if (user?.role === 'student') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Scholarships', href: '/dashboard/scholarships', icon: GraduationCap },
        { name: 'Counselors', href: '/dashboard/counselors', icon: Users },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];
    }
    
    if (user?.role === 'counselor') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Students', href: '/dashboard', icon: Users },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];
    }

    if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'User Management', href: '/dashboard', icon: Users },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
      ];
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="p-1.5 scholarship-gradient rounded-lg shadow-lg shadow-primary/10 transition-transform group-hover:scale-110">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight hidden sm:block">EduPathway</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 mx-8 uppercase tracking-widest text-[10px] font-black">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-gray-500 hover:text-primary transition-colors flex items-center gap-2 hover:bg-gray-50 rounded-lg"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:block relative w-64 group">
              <Input 
                placeholder="Search..." 
                className="h-9 bg-gray-50 border-none text-xs pl-8 focus:ring-1 focus:ring-primary/20"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            </div>

            <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 rounded-full hover:bg-gray-100 hidden sm:flex">
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-red-500 rounded-full" />
            </Button>

            <div className="h-8 w-px bg-gray-100 hidden sm:block" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-1.5 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
              >
                <div className="h-9 w-9 rounded-full scholarship-gradient flex items-center justify-center text-white text-sm font-black shadow-lg transition-transform group-hover:scale-110">
                  {user?.name?.charAt(0)}
                </div>
              </button>

              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 divide-y divide-gray-50 z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Account Role</p>
                      <p className="text-xs font-bold text-primary capitalize">{user?.role}</p>
                    </div>
                    <div className="py-2">
                       <Link 
                        href="/dashboard/settings" 
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                       >
                         <Settings className="h-4 w-4 text-gray-400" />
                         Account Settings
                       </Link>
                    </div>
                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden p-0 h-9 w-9"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-xl p-4 space-y-2 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-600"
            >
              <link.icon className="h-5 w-5 text-primary" />
              {link.name}
            </Link>
          ))}
          <Button 
            className="w-full justify-start gap-3 p-4 h-auto text-red-500 hover:text-red-600 hover:bg-red-50"
            variant="ghost"
            onClick={() => {
              logout();
              setIsMenuOpen(false);
            }}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}
