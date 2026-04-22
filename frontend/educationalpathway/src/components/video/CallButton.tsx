'use client';

import { useState } from 'react';
import { Video, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { joinSession } from '@/features/counselor/api/counselor-api';
import toast from 'react-hot-toast';

interface CallButtonProps {
  bookingId: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
}

export const CallButton = ({ bookingId, disabled = false, size = 'md', variant = 'primary' }: CallButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleJoinSession = async () => {
    setLoading(true);
    try {
      const response = await joinSession(bookingId);
      if (response.success && response.data.meetingLink) {
        window.open(response.data.meetingLink, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Failed to join session');
      }
    } catch (error: any) {
      console.error('Failed to join session:', error);
      toast.error(error?.response?.data?.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg'
  };

  const variantClasses = variant === 'primary' 
    ? 'primary-gradient text-primary-foreground' 
    : variant === 'outline' 
      ? 'border-2 border-primary text-primary hover:bg-primary/10'
      : 'text-primary hover:bg-primary/10';

  return (
    <Button
      onClick={handleJoinSession}
      disabled={disabled || loading}
      className={`${sizeClasses[size]} ${variantClasses}`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <Video className="h-5 w-5 mr-2" />
          Join Video Call
        </>
      )}
    </Button>
  );
};

interface CallButtonCompactProps {
  bookingId: number;
  disabled?: boolean;
}

export const CallButtonCompact = ({ bookingId, disabled = false }: CallButtonCompactProps) => {
  const [loading, setLoading] = useState(false);

  const handleJoinSession = async () => {
    setLoading(true);
    try {
      const response = await joinSession(bookingId);
      if (response.success && response.data.meetingLink) {
        window.open(response.data.meetingLink, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Failed to join session');
      }
    } catch (error: any) {
      console.error('Failed to join session:', error);
      toast.error(error?.response?.data?.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={handleJoinSession}
      disabled={disabled || loading}
      className="h-10 w-10"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      ) : (
        <Phone className="h-5 w-5" />
      )}
    </Button>
  );
};