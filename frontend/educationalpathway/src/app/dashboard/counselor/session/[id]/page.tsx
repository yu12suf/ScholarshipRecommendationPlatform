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
  Loader2, 
  Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getBookingDetails, getBookingThread, sendBookingMessage } from '@/features/counselor/api/counselor-api';
import { VideoCall } from '@/components/video/VideoCall';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '@/providers/auth-context';

interface Message {
  id: number;
  senderUserId: number;
  content: string;
  createdAt: string;
}

interface BookingData {
  id: number;
  status: string;
  meetingLink: string;
  slot?: {
    startTime: string;
    endTime: string;
    consultationMode?: string;
  };
  student?: {
    name: string;
    userId?: number;
  };
  counselor?: {
    name: string;
    email: string;
    userId?: number;
  };
}

export default function CounselorSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const bookingId = parseInt(resolvedParams.id);

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'video' | 'messages'>('video');
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
    fetchMessages();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await getBookingDetails(bookingId);
      if (response.success) {
        setBooking(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await getBookingThread(bookingId);
      if (response.success) {
        setMessages(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !booking?.student) return;

    setSendingMessage(true);
    try {
      const studentData = booking.student as any;
      const studentUserId = studentData?.userId;
      
      if (!studentUserId) {
        toast.error('Cannot send message: student user ID not available');
        return;
      }

      await sendBookingMessage(bookingId, {
        receiverId: studentUserId,
        body: messageInput.trim()
      });

      setMessageInput('');
      await fetchMessages();
      toast.success('Message sent');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error?.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
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
        <Button onClick={() => router.push('/dashboard/counselor/bookings')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>
      </div>
    );
  }

  if (inCall) {
    const studentName = (booking.student as any)?.name || 'Student';
    return (
      <VideoCall
        bookingId={bookingId}
        peerUserId={booking.studentId}
        peerUserName={studentName}
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
            onClick={() => router.push('/dashboard/counselor/bookings')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="h2">Session Details</h1>
            <p className="text-muted-foreground">
              {booking.student?.name || 'Student'} - Session #{booking.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'video' ? 'default' : 'outline'}
            onClick={() => setActiveTab('video')}
          >
            <Video className="h-4 w-4 mr-2" />
            Video Call
          </Button>
          <Button
            variant={activeTab === 'messages' ? 'default' : 'outline'}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </Button>
        </div>
      </div>

      {activeTab === 'video' && (
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
                  <label className="text-sm text-muted-foreground">Student</label>
                  <p className="font-medium">{booking.student?.name || 'N/A'}</p>
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
                  ) : booking.status === 'completed' ? (
                    <div className="text-center text-muted-foreground">
                      This session has been completed.
                    </div>
                  ) : booking.status === 'cancelled' ? (
                    <div className="text-center text-destructive">
                      This session was cancelled.
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      This session cannot be joined at this time.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'messages' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-40" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderUserId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderUserId === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {format(parseISO(message.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sendingMessage}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sendingMessage}
                size="icon"
              >
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}