'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  X, 
  Check, 
  Video, 
  Phone, 
  MessageSquare,
  Loader2,
  AlertCircle,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getCounselorSlotsById, bookSession, AvailabilitySlot, BookingConfirmation } from '../api/counselor-api';
import api from '@/lib/api';
import { format, parseISO, isToday, isTomorrow, isPast, isBefore, startOfToday } from 'date-fns';

interface BookingModalProps {
  counselor: {
    id: number;
    name: string;
    areasOfExpertise: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (booking: BookingConfirmation) => void;
}

export const BookingModal = ({ counselor, isOpen, onClose, onSuccess }: BookingModalProps) => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && counselor?.id) {
      fetchSlots();
    }
  }, [isOpen, counselor?.id]);

  const fetchSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCounselorSlotsById(counselor.id);
      const today = startOfToday();
      const now = new Date();
      
      const availableSlots = Array.isArray(data) 
        ? data.filter((slot: AvailabilitySlot) => {
            if (slot.status !== 'available') return false;
            try {
              const slotStart = parseISO(slot.startTime);
              const slotDate = startOfToday(slotStart);
              if (isBefore(slotDate, today)) return false;
              if (isBefore(slotStart, now)) return false;
              return true;
            } catch {
              return false;
            }
          })
        : [];
      setSlots(availableSlots);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setError('Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;
    
    setSubmitting(true);
    setError(null);
    try {
      const booking = await bookSession({
        slotId: selectedSlot,
        notes: notes.trim() || undefined
      });
      onSuccess(booking);
      onClose();
    } catch (err: any) {
      console.error('Booking failed:', err);
      setError(err.response?.data?.message || 'Failed to book session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSlotDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  const formatSlotTime = (dateStr: string) => {
    return format(parseISO(dateStr), 'h:mm a');
  };

  const getConsultationIcon = (mode?: string) => {
    switch (mode?.toLowerCase()) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div>
            <h2 className="text-xl font-bold">Book Session</h2>
            <p className="text-sm text-muted-foreground">with {counselor.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading available slots...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-bold text-lg">No Available Slots</h3>
              <p className="text-muted-foreground mt-2">
                This counselor hasn't added any available time slots yet. 
                Please check back later or contact support.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Select a Time Slot
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedSlot === slot.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{formatSlotDate(slot.startTime)}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
                          </p>
                        </div>
                        {selectedSlot === slot.id && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      {slot.consultationMode && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          {getConsultationIcon(slot.consultationMode)}
                          <span className="capitalize">{slot.consultationMode}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Notes (Optional)</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What would you like to discuss in this session? Any specific questions or topics..."
                  className="w-full h-32 p-3 bg-muted/50 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {notes.length}/2000 characters
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedSlot 
                ? `${slots.filter(s => s.status === 'available').length} slot(s) available`
                : 'Select a time slot to continue'
              }
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleBooking}
                disabled={!selectedSlot || submitting}
                className="primary-gradient text-primary-foreground"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface BookingSuccessModalProps {
  booking: BookingConfirmation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingSuccessModal = ({ booking, isOpen, onClose }: BookingSuccessModalProps) => {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  if (!isOpen || !booking) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), 'h:mm a');
    } catch {
      return dateStr;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !booking.counselor?.userId) return;
    
    setSendingMessage(true);
    try {
      // Start conversation and send message
      await api.post('/chat/start', { receiverId: booking.counselor.userId });
      await api.post('/chat/send', { 
        receiverId: booking.counselor.userId, 
        content: message.trim() 
      });
      toast.success('Message sent! You can continue chatting from the Messages page.');
      // Clear the message after sending
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Could not send message. Try again from the chat page.');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md max-h-[85vh] bg-card rounded-xl shadow-2xl border border-border overflow-y-auto">
        <div className="p-8 text-center">
          <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-success" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-6">
            Your session has been successfully booked. The counselor has been notified.
          </p>

          <div className="bg-muted/30 rounded-lg p-4 text-left space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Counselor</span>
              <span className="font-medium">{booking.counselor?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Date</span>
              <span className="font-medium">{formatDate(booking.slot?.startTime)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Time</span>
              <span className="font-medium">{formatTime(booking.slot?.startTime)}</span>
            </div>
            {booking.meetingLink ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Meeting Link</span>
                <a 
                  href={booking.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Join Session
                </a>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                The meeting link will be available after the counselor prepares the session.
              </div>
            )}
          </div>

          {/* Message Section */}
          <div className="mb-4">
            <label className="text-sm text-muted-foreground block mb-2">
              Send a message to {booking.counselor?.name}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'm excited for our session. I wanted to ask..."
              className="w-full h-20 p-3 bg-muted border border-border rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">{message.length}/500</span>
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!message.trim() || sendingMessage}
                className="flex items-center gap-1"
              >
                {sendingMessage ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                onClose();
                router.push('/dashboard/student/bookings');
              }} 
              className="flex-1"
            >
              View Bookings
            </Button>
            <Button 
              onClick={onClose} 
              className="flex-1 primary-gradient text-primary-foreground"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};