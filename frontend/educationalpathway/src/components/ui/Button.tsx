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
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 ",
    secondary: "bg-emerald-900 text-white hover:bg-emerald-800 ",
    outline: "border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50",
    ghost: "bg-transparent text-emerald-700 hover:bg-emerald-50",
    destructive: "bg-red-600 text-white hover:bg-red-700 ",
    gold: "bg-yellow-500 text-white hover:bg-yellow-600 ",
    scholarship: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 ",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-2.5 text-base rounded-lg",
    xl: "px-8 py-3 text-lg rounded-lg",
    icon: "h-9 w-9 p-0 rounded-lg",
  };

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center font-medium",
        "transition-all duration-200 ease-in-out",
        "active:scale-[0.97]",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/40",
        "disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
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
