'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MessageSquare, MapPin, ArrowRight, Loader2, AlertCircle, User, ChevronRight, Hash, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getMyBookings, getMyUpcomingBookings, StudentBooking } from '@/features/counselor/api/counselor-api';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import toast from 'react-hot-toast';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<StudentBooking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<StudentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const [allResponse, upcomingResponse] = await Promise.all([
        getMyBookings(),
        getMyUpcomingBookings()
      ]);
      
      console.log('All bookings loaded:', Array.isArray(allResponse) ? allResponse.length : 'not array', 'bookings');
      
      if (Array.isArray(allResponse)) {
        setBookings(allResponse);
      } else if (allResponse && allResponse.success) {
        setBookings(allResponse.data || []);
      } else if (allResponse && allResponse.data) {
        setBookings(allResponse.data || []);
      }
      if (Array.isArray(upcomingResponse)) {
        setUpcomingBookings(upcomingResponse);
      } else if (upcomingResponse && upcomingResponse.success) {
        setUpcomingBookings(upcomingResponse.data || []);
      } else if (upcomingResponse && upcomingResponse.data) {
        setUpcomingBookings(upcomingResponse.data || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);
      console.error('Error response:', error?.response?.data);
      const errorMessage = error?.response?.data?.message || 'Failed to load bookings';
      if (errorMessage.includes('Student profile not found')) {
        setBookings([]);
        setUpcomingBookings([]);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'h:mm a');
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string, isExpired: boolean = false) => {
    if (isExpired && status === 'pending') {
      return <span className="px-3 py-1 bg-muted/20 text-muted-foreground text-xs font-bold rounded-full">Expired</span>;
    }
    switch (status) {
      case 'confirmed':
        return <span className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full">Confirmed • Ready</span>;
      case 'started':
        return <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">In Session • Live</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-muted/20 text-muted-foreground text-xs font-bold rounded-full">Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-destructive/10 text-destructive text-xs font-bold rounded-full">Cancelled</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-warning/10 text-warning text-xs font-bold rounded-full">Pending</span>;
      default:
        return <span className="px-3 py-1 bg-muted/20 text-muted-foreground text-xs font-bold rounded-full capitalize">{status}</span>;
    }
  };

  const getSessionType = (mode?: string) => {
    switch (mode) {
      case 'video':
        return 'Video Call';
      case 'phone':
        return 'Phone Call';
      case 'chat':
        return 'Chat';
      default:
        return 'Video Call';
    }
  };

  const formatDuration = (start: string, end: string) => {
    try {
      const startDate = parseISO(start);
      const endDate = parseISO(end);
      const mins = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
      return `${mins} min session`;
    } catch {
      return 'session';
    }
  };

  const filteredBookings = activeTab === 'upcoming' 
    ? bookings.filter(b => {
        if (b.status === 'completed' || b.status === 'cancelled') return false;
        if (!b.slot?.startTime) return false;
        return !isPast(parseISO(b.slot.startTime));
      })
    : activeTab === 'past'
      ? bookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || (b.slot?.startTime && isPast(parseISO(b.slot.startTime))))
      : bookings;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="space-y-3">
          <h1 className="h1 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            My Bookings
          </h1>
          <p className="text-body text-muted-foreground max-w-2xl">
            View and manage your scheduled sessions with counselors. Join video calls or send messages to your counselor.
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {(['upcoming', 'past', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          {tab === 'upcoming' && (
              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                {filteredBookings.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <Card className="border border-dashed border-border">
          <CardBody className="py-20 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-bold mb-2">No Bookings Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming sessions. Book a session with a counselor to get started."
                : activeTab === 'past'
                  ? "You don't have any past sessions."
                  : "You haven't booked any sessions yet."}
            </p>
            <Link href="/dashboard/counselors">
              <Button className="primary-gradient text-primary-foreground">
                Find a Counselor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const slotStart = booking.slot?.startTime;
            const slotEnd = booking.slot?.endTime;
            const consultationMode = booking.slot?.consultationMode || 'video';
            const isExpired = !!slotStart && isPast(parseISO(slotStart));
            const isUpcoming = !!slotStart && !isPast(parseISO(slotStart)) && ['confirmed', 'pending'].includes(booking.status);
            
            return (
              <Link href={`/dashboard/student/session/${booking.id}`} key={booking.id}>
              <Card className="border border-border bg-card hover:border-primary/30 transition-all cursor-pointer group">
                <CardBody className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-14 w-14 rounded-full primary-gradient flex items-center justify-center font-bold text-white text-lg shrink-0 group-hover:scale-105 transition-transform">
                        {booking.counselor?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || booking.counselor?.name?.[0] || 'C'}
                      </div>
                      
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                            {booking.counselor?.name || `Counselor #${booking.counselorId}`}
                          </h3>
                          {getStatusBadge(booking.status, isExpired)}
                        </div>
                        
                        <div className="flex items-center gap-4 flex-wrap text-sm">
                          {slotStart ? (
                            isPast(parseISO(slotStart)) ? (
                              <span className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-2 py-1 rounded-md text-sm">
                                <Clock className="h-3.5 w-3.5" />
                                Session passed
                              </span>
                            ) : (
                              <>
                                <span className="flex items-center gap-1.5 text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatDate(slotStart)}
                                </span>
                                <span className="flex items-center gap-1.5 text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatTime(slotStart)} - {formatTime(slotEnd)}
                                </span>
                                <span className="flex items-center gap-1.5 text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                                  {getSessionType(consultationMode)}
                                </span>
                                <span className="text-muted-foreground/70 text-xs">
                                  {formatDuration(slotStart, slotEnd)}
                                </span>
                              </>
                            )
                          ) : (
                            <span className="flex items-center gap-2 text-warning bg-warning/10 px-2 py-1 rounded-md text-sm">
                              <Clock className="h-3.5 w-3.5" />
                              Scheduling in progress...
                            </span>
                          )}
                          
                          {booking.meetingLink && (
                            <span className="flex items-center gap-1.5 text-primary bg-primary/10 px-2 py-1 rounded-md font-medium">
                              <Video className="h-3.5 w-3.5" />
                              Meeting Ready
                            </span>
                          )}
                          
                          {!booking.meetingLink && isUpcoming && !isExpired && (
                            <span className="flex items-center gap-1.5 text-muted-foreground/70 px-2 py-1 rounded-md text-xs">
                              <Clock className="h-3.5 w-3.5" />
                              Link shared when session starts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      {['confirmed', 'started'].includes(booking.status) && slotStart && !isExpired && (
                        <>
                          <Link href={`/dashboard/student/session/${booking.id}`}>
                            <Button className="h-11 px-6 font-bold primary-gradient text-primary-foreground">
                              <Video className="h-5 w-5 mr-2" />
                              Join Session
                            </Button>
                          </Link>
                          <Link href={`/dashboard/student/session/${booking.id}?tab=messages`}>
                            <Button variant="outline" className="h-11 px-4">
                              <MessageSquare className="h-5 w-5" />
                            </Button>
                          </Link>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <Link href={`/dashboard/student/session/${booking.id}`}>
                          <Button variant="outline" className="h-11">
                            View Details
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      
                      {booking.status === 'pending' && (
                        <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" />
                          Booked {booking.createdAt ? format(parseISO(booking.createdAt), 'MMM d, yyyy') : 'recently'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground/60">
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      #{booking.id}
                    </span>
                    {booking.createdAt && (
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        Booked {format(parseISO(booking.createdAt), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </CardBody>
              </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}