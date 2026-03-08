import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gold' | 'scholarship';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20',
      secondary: 'bg-secondary text-white hover:opacity-90 shadow-lg shadow-secondary/20',
      outline: 'border-2 border-primary/20 bg-transparent text-primary hover:bg-primary/5',
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
      destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20',
      gold: 'gold-gradient text-primary font-bold shadow-lg shadow-secondary/30 hover:opacity-90',
      scholarship: 'scholarship-gradient text-white font-bold shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:-translate-y-0.5',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-sm',
      md: 'px-4 py-2 text-sm rounded-sm',
      lg: 'px-6 py-3 text-base rounded-sm',
      xl: 'px-8 py-4 text-lg rounded-sm',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

Button.displayName = 'Button';
