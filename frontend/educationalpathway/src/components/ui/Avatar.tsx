import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
}

export const Avatar = ({ className, size = 'md', children, ...props }: AvatarProps) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full border border-border/10 shadow-sm',
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const AvatarImage = ({ className, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
  if (!src) return null;
  
  return (
    <img
      src={src}
      alt="Avatar"
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  );
};

export const AvatarFallback = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground font-medium',
        className
      )}
      {...props}
    >
      {children || '?'}
    </div>
  );
};
