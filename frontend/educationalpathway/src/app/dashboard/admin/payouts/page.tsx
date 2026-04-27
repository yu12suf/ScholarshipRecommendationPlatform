'use client';

import { useEffect, useState } from 'react';
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    Search, 
    Filter, 
    ExternalLink,
    Banknote,
    User,
    ArrowUpRight,
    Loader2,
    Check
} from 'lucide-react';
import { Card, CardBody, Button, Badge, Input } from '@/components/ui';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function AdminPayoutsPage() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            // Updated endpoint to fetch all payout requests
            const res = await api.get('/counselors/admin/payouts');
            setPayouts(res.data?.data || res.data || []);
        } catch (error) {
            toast.error("Failed to load payout requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const handleAction = async (payoutId: number, action: 'approve' | 'reject') => {
        setProcessingId(payoutId);
        try {
            await api.patch(`/counselors/admin/payouts/${payoutId}/status`, {
                status: action === 'approve' ? 'approved' : 'rejected',
                adminNote: action === 'approve' ? 'Processed via Admin Dashboard' : 'Rejected by Admin'
            });
            toast.success(`Payout ${action}d successfully`);
            fetchPayouts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to process payout");
        } finally {
            setProcessingId(null);
        }
    };

    const pendingCount = payouts.filter(p => p.status === 'pending').length;

    return (
        <div className="space-y-8 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Banknote className="text-primary" size={32} />
                        Financial Settlement
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">Review and approve counselor withdrawal requests.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Card className="bg-amber-500/10 border-amber-500/20 px-6 py-3 border">
                        <div className="flex items-center gap-3">
                            <Clock className="text-amber-500" size={18} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Awaiting Action</p>
                                <p className="text-xl font-black text-amber-700 leading-none">{pendingCount} Requests</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="border-border shadow-sm overflow-hidden bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Counselor</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Method</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <Loader2 className="animate-spin mx-auto text-primary h-8 w-8" />
                                        </td>
                                    </tr>
                                ) : payouts.length > 0 ? (
                                    payouts.map((payout) => (
                                        <tr key={payout.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {payout.counselor?.user?.name?.charAt(0) || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground">{payout.counselor?.user?.name || 'Unknown Counselor'}</p>
                                                        <p className="text-[10px] text-muted-foreground">{payout.counselor?.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-foreground">
                                                    {payout.amount?.toLocaleString()} <span className="text-[10px] text-muted-foreground">ETB</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="capitalize text-[10px] font-bold">
                                                    {payout.payoutMethod?.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={`uppercase text-[10px] font-black ${
                                                    payout.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                    payout.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    'bg-red-500/10 text-red-500'
                                                }`}>
                                                    {payout.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-bold text-muted-foreground">
                                                    {new Date(payout.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {payout.status === 'pending' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-8 px-3 border-emerald-500/50 text-emerald-600 hover:bg-emerald-50"
                                                            onClick={() => handleAction(payout.id, 'approve')}
                                                            disabled={processingId === payout.id}
                                                        >
                                                            {processingId === payout.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            className="h-8 px-3 border-red-500/50 text-red-600 hover:bg-red-50"
                                                            onClick={() => handleAction(payout.id, 'reject')}
                                                            disabled={processingId === payout.id}
                                                        >
                                                            <XCircle size={14} />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold opacity-40">Processed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <p className="text-muted-foreground italic">No payout requests found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
