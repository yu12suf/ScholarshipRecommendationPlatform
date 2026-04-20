'use client';

import { Calendar, Loader2, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface StudentBookingModalProps {
  counselor: {
    id: number;
    name: string;
    hourlyRate?: number;
    profileImageUrl?: string;
  };
  onClose: () => void;
  onSuccess?: () => void;
}

export const StudentBookingModal = ({ counselor, onClose, onSuccess }: StudentBookingModalProps) => {
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  useEffect(() => {
    const fetchAvailableSessions = async () => {
      setLoadingSlots(true);
      try {
        const response = await api.get(`/counselors/${counselor.id}/available-sessions`);
        setSlots(response.data || []);
      } catch (error) {
        toast.error("Failed to load available sessions");
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchAvailableSessions();
  }, [counselor.id]);

  const handleBookSession = async () => {
    if (!selectedSlot) return toast.error("Please select a time slot");
    setBookingInProgress(true);
    try {
      const response = await api.post('/counselors/bookings', { slotId: selectedSlot.id });
      const { checkoutUrl } = response.data;
      
      if (checkoutUrl) {
        toast.loading("Redirecting to secure payment...");
        window.location.href = checkoutUrl;
      } else {
        toast.success("Booking confirmed successfully!");
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process booking");
    } finally {
      setBookingInProgress(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-border bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted border-2 border-primary/20">
              {counselor.profileImageUrl ? (
                <img src={counselor.profileImageUrl} alt={counselor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-bold text-xl bg-primary/10">
                  {counselor.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Book a Session</h2>
              <p className="text-muted-foreground">with {counselor.name}</p>
            </div>
          </div>
        </div>
        
        {/* Slot Selection */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Available Slots
            </h3>
            <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
              {Number(counselor.hourlyRate || 500)} ETB / Session
            </span>
          </div>

          {loadingSlots ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <Loader2 className="animate-spin text-primary w-10 h-10" />
              <p className="text-sm text-muted-foreground animate-pulse">Finding best times for you...</p>
            </div>
          ) : slots.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                const startDate = new Date(slot.startTime);
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`group relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                        : 'border-border bg-background hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className={`font-bold transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="bg-primary text-primary-foreground p-1 rounded-full animate-in zoom-in scale-110">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-12 border-2 border-dashed rounded-3xl border-border bg-muted/10">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="font-bold text-lg">Fully Booked</h3>
              <p className="text-muted-foreground mt-2 max-w-[200px] mx-auto">
                No sessions available at the moment. Please check back later or try another counselor.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border bg-muted/5 flex gap-4">
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={bookingInProgress}
            className="flex-1 rounded-2xl h-12 font-semibold"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBookSession} 
            disabled={!selectedSlot || bookingInProgress}
            isLoading={bookingInProgress}
            className="flex-[1.5] primary-gradient rounded-2xl h-12 font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            Confirm & Pay
          </Button>
        </div>
      </div>
    </div>
  );
};
