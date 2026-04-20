'use client';

import { Calendar, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import { createBooking } from '../api/counselor-api';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface BookingModalProps {
  counselor: {
    id: number;
    name: string;
    hourlyRate?: number;
  };
  mode?: 'booking' | 'initiation';
  studentUserId?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookingModal = ({ counselor, mode = 'initiation', studentUserId, onClose, onSuccess }: BookingModalProps) => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [bookingSlot, setBookingSlot] = useState<any>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        // Counselors always see their own slots for invitation
        const response = await api.get('/counselors/slots');
        setSlots(response.data || []);
      } catch (error) {
        toast.error("Failed to load your slots");
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, []);

  const handleProposeSession = async () => {
    if (!bookingSlot) return toast.error("Please select a slot");
    if (!studentUserId) return toast.error("Student ID is required");
    
    setBookingInProgress(true);
    try {
      await api.post('/counselors/initiate-booking', { 
        studentUserId, 
        slotId: bookingSlot.id 
      });
      toast.success("Session invitation sent successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    } finally {
      setBookingInProgress(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border bg-muted/30">
          <h2 className="text-xl font-bold font-heading">Invite for a Session</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Build a connection with this student by proposing a time.
          </p>
        </div>
        
        <div className="p-6">
          {loadingSlots ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
          ) : slots.length > 0 ? (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setBookingSlot(slot)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                    bookingSlot?.id === slot.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border bg-background hover:bg-muted'
                  }`}
                >
                  <div>
                    <div className="font-bold text-foreground">
                      {new Date(slot.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {bookingSlot?.id === slot.id && <div className="text-primary"><CheckCircle className="w-5 h-5" /></div>}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed rounded-xl border-border bg-muted/20">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="font-bold">No Slots Available</h3>
              <p className="text-sm text-muted-foreground mt-1">You need to create available slots in your schedule first.</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/10">
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={bookingInProgress}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleProposeSession} 
            disabled={!bookingSlot || bookingInProgress}
            isLoading={bookingInProgress}
            className="primary-gradient font-bold h-11 px-6"
          >
            Send Invitation
          </Button>
        </div>
      </div>
    </div>
  );
};
