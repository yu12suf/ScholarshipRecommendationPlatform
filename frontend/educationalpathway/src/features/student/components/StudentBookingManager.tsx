'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Video, Clock, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardBody, Button, Badge, Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

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

    const upcoming = bookings.filter(b => b.status === 'confirmed');
    const pending = bookings.filter(b => b.status === 'pending');
    const past = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

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
                                            <Avatar className="h-12 w-12 rounded-xl border-2 border-primary/20">
                                                <AvatarImage src={booking.counselor?.user?.profileImageUrl} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {booking.counselor?.user?.name?.[0] || 'C'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-bold text-foreground">Session with {booking.counselor?.user?.name || 'Academic Counselor'}</h3>
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

            {/* Pending Section Optional - User requested only confirmed ones, but keeping for reference if needed */}
            {/* You can uncomment this if you want to see sessions awaiting payment */}
            {/* 
            {pending.length > 0 && (
                ...
            )} 
            */}

            {past.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold opacity-60">History</h2>
                    <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
                         {past.map((booking) => (
                             <div key={booking.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                 <div className="flex items-center gap-4">
                                     <div className={`h-8 w-8 rounded-full flex items-center justify-center ${booking.status === 'completed' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                                         {booking.status === 'completed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                     </div>
                                     <div>
                                         <p className="text-sm font-bold">Session with {booking.counselor?.user?.name || 'Counselor'}</p>
                                         <p className="text-[11px] text-muted-foreground">
                                             {booking.slot?.startTime 
                                                ? new Date(booking.slot.startTime).toLocaleDateString() 
                                                : 'Date unknown'}
                                         </p>
                                     </div>
                                 </div>
                                 <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest px-2 py-0 border-muted-foreground/30 text-muted-foreground/60">
                                     {booking.status}
                                 </Badge>
                             </div>
                         ))}
                    </div>
                </div>
            )}

            {bookings.length === 0 && (
                <div className="py-20 text-center bg-card/30 border border-dashed border-border rounded-3xl">
                    <Calendar className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">No sessions yet</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        Once you book a consultation with one of our academic experts, it will appear here.
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
