'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Calendar, CheckCircle, Loader2, ArrowUpRight } from 'lucide-react';
import { Card, CardBody, Badge } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export const PayoutHistory = () => {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                const res = await api.get('/counselors/me/payouts');
                setPayouts(res.data || []);
            } catch (error) {
                console.error("Failed to fetch payouts", error);
                toast.error("Could not load payout history");
            } finally {
                setLoading(false);
            }
        };
        fetchPayouts();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <DollarSign className="text-primary" size={24} />
                    Payout History
                </h2>
                <Badge variant="outline" className="text-[10px] font-bold">
                    {payouts.length} Total Payouts
                </Badge>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {payouts.length > 0 ? (
                    payouts.map((payout) => (
                        <div key={payout.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <ArrowUpRight size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Withdrawal - {payout.transactionReference}</div>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                        <Calendar size={10} />
                                        {new Date(payout.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1.5">
                                <div className="text-sm font-black text-foreground">
                                    {Number(payout.amount).toLocaleString()} ETB
                                </div>
                                <Badge className="bg-success/10 text-success border-none text-[9px] font-black h-5 uppercase">
                                    {payout.status}
                                </Badge>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center text-muted-foreground">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-10" />
                        <p className="text-sm font-medium">No payouts processed yet.</p>
                        <p className="text-[10px] mt-1">Earnings will appear here once an admin processes your withdrawal.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
