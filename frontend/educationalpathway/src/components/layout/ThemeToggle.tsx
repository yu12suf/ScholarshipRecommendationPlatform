"use client";

import { useTheme, type ThemeMode } from "@/providers/theme-context";
import { Sun, Moon, Laptop } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
      {(["light", "dark", "system"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setMode(t)}
          className={`relative p-2 rounded-lg transition-colors ${
            mode === t
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
          title={`${t.charAt(0).toUpperCase() + t.slice(1)} Mode`}
        >
          {mode === t && (
            <motion.div
              layoutId="activeTheme"
              className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">
            {t === "light" && <Sun className="h-4 w-4" />}
            {t === "dark" && <Moon className="h-4 w-4" />}
            {t === "system" && <Laptop className="h-4 w-4" />}
          </span>
        </button>
      ))}
    </div>
  );
}
