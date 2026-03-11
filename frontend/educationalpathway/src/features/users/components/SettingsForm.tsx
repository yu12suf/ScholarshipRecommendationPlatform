
"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Sun,
  Moon,
  Monitor,
  Palette,
} from "lucide-react";

import { Button } from "@/components/ui";
import { useTheme, ThemeMode } from "@/providers/theme-context";
import { motion, AnimatePresence } from "framer-motion";

export const SettingsForm = () => {
  const { mode, setMode } = useTheme();
  const [activeTab, setActiveTab] = useState("appearance");

  const tabs = [
    { id: "profile", title: "Profile", icon: User },
    { id: "notifications", title: "Notifications", icon: Bell },
    { id: "security", title: "Security", icon: Shield },
    { id: "appearance", title: "Appearance", icon: Palette },
    { id: "billing", title: "Billing", icon: CreditCard },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 mt-4">

      <div className="flex flex-col lg:flex-row gap-12">

        {/* Sidebar - Chrome Style */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-full text-sm font-medium transition-colors
                    ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted font-medium hover:text-foreground"
                    }
                  `}
                >
                  <Icon size={18} className={active ? "text-primary" : "text-muted-foreground"} />
                  {tab.title}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Settings Panel */}
        <main className="flex-1 max-w-2xl">

          <AnimatePresence mode="wait">

            {/* APPEARANCE */}
            {activeTab === "appearance" && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >

                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    Appearance
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customize the look and feel of the platform.
                  </p>
                </div>

                {/* Chrome-like grouped list */}
                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">

                  {/* Theme Selector */}
                  <div className="flex items-center justify-between p-5 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        Theme
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        Choose your preferred color theme
                      </span>
                    </div>

                    <div className="relative">
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value as ThemeMode)}
                        className="appearance-none bg-muted hover:bg-muted/80 text-foreground text-sm font-medium border border-border/50 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-colors"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>

                  </div>

                  {/* Accent Color (Example setting) */}
                  <div className="flex items-center justify-between p-5 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                     <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        Accent Color
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        Customize primary brand color
                      </span>
                    </div>
                    
                    <button className="text-sm font-medium text-primary hover:underline px-2 py-1 relative">
                       <span className="flex items-center gap-2">
                         <span className="h-4 w-4 rounded-full bg-primary block shadow-inner"></span>
                         Blue
                       </span>
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

            {/* OTHER SETTINGS */}
            {activeTab !== "appearance" && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >

                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground capitalize">
                    {tabs.find(t => t.id === activeTab)?.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure your {activeTab} preferences.
                  </p>
                </div>

                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">

                  <div className="flex items-center justify-between p-5 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        Update {activeTab} information
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        Modify your {activeTab} settings
                      </span>
                    </div>

                    <Button variant="outline" size="sm" className="rounded-full px-5">
                      Edit
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-5 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        Privacy Controls
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        Manage visibility and access
                      </span>
                    </div>

                    <Button variant="outline" size="sm" className="rounded-full px-4">
                      Configure
                    </Button>
                  </div>

                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </main>
      </div>
    </div>
  );
};

