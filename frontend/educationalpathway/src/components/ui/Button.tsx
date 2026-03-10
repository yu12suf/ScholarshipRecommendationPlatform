import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",

      secondary:
        "bg-gray-900 text-white hover:bg-gray-800 shadow-sm",

      outline:
        "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",

      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100",

      destructive:
        "bg-red-600 text-white hover:bg-red-700 shadow-sm",

      gold:
        "bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm",

      scholarship:
        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-sm",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-sm",
      md: "px-4 py-2 text-sm rounded-sm",
      lg: "px-6 py-2.5 text-base rounded-sm",
      xl: "px-8 py-3 text-lg rounded-sm",
      icon: "h-9 w-9 p-0 rounded-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
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
      </button>
    );
  }
);

Button.displayName = "Button";