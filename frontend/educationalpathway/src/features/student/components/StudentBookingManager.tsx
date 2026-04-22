'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Video, Clock, Loader2 } from 'lucide-react';
import { Card, CardBody, Button, Badge } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export const StudentBookingManager = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/counselors/student/bookings');
                // The api interceptor already unwraps response.data.data to res.data
                const bookingData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setBookings(bookingData);
            } catch (error) {
                console.error("Failed to fetch student bookings", error);
                toast.error("Could not load your sessions");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium">Loading your sessions...</p>
            </div>
        );
    }

    const upcoming = [...bookings].sort((a, b) => {
            const aStart = new Date(a?.slot?.startTime || 0).getTime();
            const bStart = new Date(b?.slot?.startTime || 0).getTime();
            return aStart - bStart;
        });

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight">My Counseling Sessions</h1>
                <p className="text-muted-foreground">Manage your upcoming expert consultations and meeting links.</p>
            </div>

            {upcoming.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Video className="text-emerald-500" size={24} />
                        Upcoming Sessions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {upcoming.map((booking) => (
                            <Card key={booking.id} className="overflow-hidden border-none glass-card group">
                                <CardBody className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <h3 className="font-bold text-foreground">Session with {booking.counselor?.name || booking.counselor?.user?.name || 'Academic Counselor'}</h3>
                                                <p className="text-xs text-muted-foreground">Counselor: {booking.counselor?.name || booking.counselor?.user?.name || 'Academic Counselor'}</p>
                                                <p className="text-xs text-muted-foreground">{booking.counselor?.areasOfExpertise || 'Academic Expert'}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold uppercase text-[10px]">
                                            Confirmed
                                        </Badge>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Calendar size={16} className="text-primary" />
                                            <span>
                                                {booking.slot?.startTime 
                                                    ? new Date(booking.slot.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
                                                    : 'Date to be announced'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Clock size={16} className="text-primary" />
                                            <span>
                                                {booking.slot?.startTime && booking.slot?.endTime ? (
                                                    <>
                                                        {new Date(booking.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                                        {new Date(booking.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </>
                                                ) : 'Time not set'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button 
                                            className="flex-1 primary-gradient font-bold h-11"
                                            onClick={() => {
                                                if (booking.meetingLink) window.open(booking.meetingLink, '_blank');
                                                else toast.error("Meeting link not yet available");
                                            }}
                                        >
                                            <Video className="mr-2 h-4 w-4" />
                                            Join Meeting
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {upcoming.length === 0 && (
                <div className="py-20 text-center bg-card/30 border border-dashed border-border rounded-3xl">
                    <Calendar className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">No upcoming sessions</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        Upcoming counseling sessions will appear here. Expired sessions are automatically hidden.
                    </p>
                    <Link href="/dashboard/counselors">
                        <Button className="mt-8 rounded-full px-8 primary-gradient font-bold h-11">
                            Browse Experts
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
};
