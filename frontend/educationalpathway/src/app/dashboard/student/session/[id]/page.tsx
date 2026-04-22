'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Video, 
  MessageSquare, 
  User, 
  ArrowLeft, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getBookingDetails, StudentBooking } from '@/features/counselor/api/counselor-api';
import { VideoCall } from '@/components/video/VideoCall';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

interface Message {
  id: number;
  senderUserId: number;
  content: string;
  createdAt: string;
}

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const bookingId = parseInt(resolvedParams.id);

  const [booking, setBooking] = useState<StudentBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await getBookingDetails(bookingId);
      console.log('[Session] getBookingDetails response:', response);
      if (response && response.id) {
        setBooking(response);
      } else if (response && response.data && response.data.id) {
        setBooking(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy');
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
        <h2 className="text-xl font-bold mb-2">Session Not Found</h2>
        <p className="text-muted-foreground mb-6">
          This session doesn't exist or you don't have access.
        </p>
        <Button onClick={() => router.push('/dashboard/student/bookings')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>
      </div>
    );
  }

  if (inCall) {
    return (
      <VideoCall
        bookingId={bookingId}
        peerUserId={booking.counselorId}
        peerUserName={booking.counselor?.name || 'Counselor'}
        onEndCall={() => setInCall(false)}
        onToggleChat={() => setActiveTab('messages')}
        showChatButton
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/student/bookings')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="h2">Session Details</h1>
            <p className="text-muted-foreground">
              {booking.counselor?.name || 'Counselor'} - Session #{booking.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
          >
            <Video className="h-4 w-4 mr-2" />
            Video Call
          </Button>
          <Link href="/dashboard/student/chat">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Open Chat
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {(
<Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Video Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Counselor</label>
                  <p className="font-medium">{booking.counselor?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Date</label>
                  <p className="font-medium">
                    {booking.slot?.startTime ? formatDate(booking.slot.startTime) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Time</label>
                  <p className="font-medium">
                    {booking.slot?.startTime && booking.slot?.endTime
                      ? `${formatTime(booking.slot.startTime)} - ${formatTime(booking.slot.endTime)}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <p className="font-medium capitalize">{booking.status}</p>
                </div>
              </div>

              <div className="space-y-4">
                {booking.meetingLink && (
                  <div>
                    <label className="text-sm text-muted-foreground">Meeting Link</label>
                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline block truncate"
                    >
                      {booking.meetingLink}
                    </a>
                  </div>
                )}

                <div className="pt-8">
                  {['confirmed', 'started'].includes(booking.status) ? (
                    <Button
                      onClick={() => setInCall(true)}
                      className="w-full primary-gradient text-primary-foreground h-12"
                    >
                      <Video className="h-5 w-5 mr-2" />
                      Start Video Call
                    </Button>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      Session {booking.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
)}
    </div>
  );
}