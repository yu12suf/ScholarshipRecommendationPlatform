import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps<T extends React.ElementType = "button"> {
  as?: T;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "gold"
    | "scholarship";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Button = <T extends React.ElementType = "button">({
  as,
  className,
  variant = "primary",
  size = "md",
  isLoading,
  children,
  ...props
}: ButtonProps<T> & React.ComponentPropsWithoutRef<T>) => {
  const Component = as || "button";

  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/10",
    secondary: "bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:opacity-90 shadow-md",
    outline: "border-2 border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
    ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
    destructive: "bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/10",
    gold: "bg-amber-500 text-white hover:bg-amber-400 shadow-md shadow-amber-500/10",
    indigo: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10",
    scholarship: "bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 shadow-lg shadow-emerald-600/20",
  };

  const sizes = {
    sm: "px-3 h-8 text-xs rounded-lg",
    md: "px-5 h-11 text-sm rounded-lg",
    lg: "px-8 h-14 text-base rounded-lg font-bold",
    xl: "px-10 h-16 text-lg rounded-lg font-bold",
    icon: "h-11 w-11 p-0 rounded-lg",
  };

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center font-bold tracking-tight",
        "transition-all duration-300 ease-out",
        "active:scale-[0.98] select-none",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/40",
        "disabled:opacity-50 disabled:grayscale disabled:pointer-events-none",
        variants[variant as keyof typeof variants] || variants.primary,
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </Component>
  );
};
