'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getUpcomingBookings, 
  updateBookingStatus 
} from '../api/counselor-api';
import { 
  Calendar, 
  Clock, 
  User, 
  Check, 
  X, 
  Loader2,
  CalendarDays,
  Video,
  Timer
} from 'lucide-react';
import { Button, Card, CardBody } from '@/components/ui';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, differenceInMinutes, isPast, isFuture } from 'date-fns';

const getSessionCountdown = (startTime: string) => {
  try {
    const start = parseISO(startTime);
    const now = new Date();
    const diffMinutes = differenceInMinutes(start, now);
    
    if (diffMinutes <= 0) return null;
    
    if (diffMinutes < 60) {
      return { text: `${diffMinutes} min`, className: 'text-warning' };
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return { text: `${hours} hr`, className: 'text-primary' };
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return { text: `${days} day${days > 1 ? 's' : ''}`, className: 'text-success' };
    }
  } catch {
    return null;
  }
};

const getSessionStatus = (startTime: string) => {
  try {
    const start = parseISO(startTime);
    const now = new Date();
    const diffMinutes = differenceInMinutes(start, now);
    
    if (diffMinutes <= 0 && diffMinutes > -120) return 'in_progress';
    if (diffMinutes <= -120) return 'completed';
    if (diffMinutes <= 10) return 'starting_soon';
    return 'upcoming';
  } catch {
    return 'unknown';
  }
};

export const BookingManager = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);

  const fetchBookings = async () => {
    try {
      const data = await getUpcomingBookings();
      console.log('[BookingManager] getUpcomingBookings response:', data);
      // Data is already unwrapped by API interceptor - it's directly the array
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[BookingManager] Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (error) {
      toast.error(`Failed to update booking status`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="h1">Session Requests</h1>
          <p className="text-muted-foreground mt-1">Manage student bookings and pending consultation requests.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-primary/10 rounded-lg text-primary text-sm font-bold flex items-center gap-2">
            <CalendarDays size={18} />
            {bookings.length} Total Requests
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {bookings.map((booking, idx) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="border border-border bg-card hover:border-primary/30 transition-all group shadow-sm hover:shadow-md">
                <CardBody className="p-6 space-y-6">
                  {/* Status header */}
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      booking.status === 'confirmed' ? 'bg-success/10 text-success' : 
                      booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 
                      'bg-warning/10 text-warning'
                    }`}>
                      {booking.status}
                    </span>
                    <span className="text-xs text-muted-foreground">ID: #{booking.id.toString().slice(-4)}</span>
                  </div>

                  {/* Student info */}
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center font-black text-primary text-xl">
                      {booking.student?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{booking.student?.name || 'Student'}</h3>
                      <p className="text-xs text-muted-foreground">International Applicant</p>
                    </div>
                  </div>

                  {/* Detail list */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                      <Calendar size={16} className="text-primary/60" />
                      <span className="text-sm font-medium">
                        {new Date(booking.slot?.startTime).toLocaleDateString(undefined, { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                      <Clock size={16} className="text-primary/60" />
                      <span className="text-sm font-medium">
                        {new Date(booking.slot?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(booking.slot?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {booking.slot?.startTime && (
                      <div className="flex items-center gap-2">
                        <Timer size={14} className="text-primary/60" />
                        {(() => {
                          const sessionStatus = getSessionStatus(booking.slot.startTime);
                          const countdown = getSessionCountdown(booking.slot.startTime);
                          if (sessionStatus === 'completed') {
                            return <span className="text-xs text-muted-foreground">Session completed</span>;
                          } else if (sessionStatus === 'in_progress') {
                            return <span className="text-xs text-success font-medium">In progress - Click to join</span>;
                          } else if (countdown) {
                            return (
                              <span className={`text-xs font-medium ${countdown.className}`}>
                                Starts in {countdown.text}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Video size={16} className="text-primary/60" />
                      <span className="text-sm font-medium">Virtual Consultation</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {booking.status === 'pending' && (
                    <div className="flex gap-2 pt-4">
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        className="flex-1 bg-success hover:bg-success/90 text-white font-bold h-10"
                      >
                        <Check size={16} className="mr-2" />
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        className="flex-1 font-bold h-10"
                      >
                        <X size={16} className="mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {booking.status === 'confirmed' && booking.slot?.startTime && (
                    (() => {
                      const sessionStatus = getSessionStatus(booking.slot.startTime);
                      const countdown = getSessionCountdown(booking.slot.startTime);
                      const canJoin = sessionStatus === 'in_progress' || sessionStatus === 'starting_soon' || countdown === null;
                      
                      return (
                        <Button
                          size="sm"
                          className={`w-full font-bold h-10 ${sessionStatus === 'in_progress' ? 'bg-success hover:bg-success/90 text-white' : 'primary-gradient text-white'}`}
                          onClick={() => router.push(`/dashboard/counselor/session/${booking.id}`)}
                        >
                          <Video size={16} className="mr-2" />
                          {sessionStatus === 'in_progress' ? 'Join Now' : sessionStatus === 'starting_soon' ? 'Join Session' : 'View Session'}
                        </Button>
                      );
                    })()
                  )}
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {bookings.length === 0 && (
          <div className="col-span-full py-20 text-center bg-card border border-border rounded-lg">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Active Bookings</h3>
            <p className="text-muted-foreground max-w-[300px] mx-auto">
              Your session history is empty. Make sure your availability is up to date to receive new requests!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
