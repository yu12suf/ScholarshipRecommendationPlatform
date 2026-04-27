'use client';

import { useEffect, useState } from 'react';
import { 
    Wallet, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Calendar,
    Search,
    Filter,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { Card, CardBody, Badge, Button, Input } from '@/components/ui';
import { getMyWalletLedger } from '@/features/counselor/api/counselor-api';
import { toast } from 'react-hot-toast';

export const WalletLedger = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLedger = async () => {
        setLoading(true);
        try {
            const data = await getMyWalletLedger();
            setTransactions(data || []);
        } catch (error) {
            console.error("Failed to fetch ledger", error);
            toast.error("Could not load transaction history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-primary h-10 w-10" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <RefreshCw className="text-primary" size={20} />
                        Detailed Transaction Ledger
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">Audit log of all deposits, escrow releases, and withdrawals.</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchLedger} className="h-9 px-4">
                    <RefreshCw size={14} className="mr-2" /> Refresh
                </Button>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reference</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Balance After</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                                                    tx.entryType === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                    {tx.entryType === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                </div>
                                                <span className="text-xs font-bold capitalize">{tx.entryType}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-foreground">{tx.reference}</span>
                                                    {tx.payoutStatus && (
                                                        <Badge 
                                                            variant={tx.payoutStatus === 'approved' ? 'success' : 'secondary'} 
                                                            className="text-[8px] h-4 px-1.5 uppercase tracking-tighter"
                                                        >
                                                            {tx.payoutStatus}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground truncate max-w-[200px] mt-0.5">{tx.note}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-black ${
                                                Number(tx.amount) > 0 ? 'text-emerald-500' : 'text-amber-500'
                                            }`}>
                                                {Number(tx.amount) > 0 ? '+' : ''}{Number(tx.amount).toLocaleString()} ETB
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-500">
                                                {Number(tx.balanceAfter).toLocaleString()} ETB
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                                                <Calendar size={12} />
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                         <p className="text-sm text-muted-foreground">No transactions recorded yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
