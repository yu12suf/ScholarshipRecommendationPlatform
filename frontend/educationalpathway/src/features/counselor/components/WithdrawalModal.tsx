'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Model';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Wallet, Loader2, Landmark, Phone, Search } from 'lucide-react';
import { requestPayout } from '@/features/counselor/api/counselor-api';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

interface Bank {
    id: number | string;
    name: string;
    code: string;
}

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableBalance: number;
    onSuccess: () => void;
}

export const WithdrawalModal = ({ isOpen, onClose, availableBalance, onSuccess }: WithdrawalModalProps) => {
    const [amount, setAmount] = useState<string>('');
    const [method, setMethod] = useState<'bank_transfer' | 'fana' | 'telebirr'>('bank_transfer');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Details
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [phone, setPhone] = useState('');
    
    // Bank Selection
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [bankSearch, setBankSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchBanks = async () => {
                setLoadingBanks(true);
                try {
                    const res = await api.get('/counselors/banks');
                    setBanks(res.data?.data || []);
                } catch (error) {
                    console.error("Failed to fetch banks", error);
                } finally {
                    setLoadingBanks(false);
                }
            };
            fetchBanks();
        }
    }, [isOpen]);

    const filteredBanks = banks.filter(b => 
        b.name.toLowerCase().includes(bankSearch.toLowerCase())
    );

    const handleSubmit = async () => {
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) return toast.error("Enter a valid amount");
        if (numAmount > availableBalance) return toast.error("Insufficient balance");
        if (numAmount < 100) return toast.error("Minimum 100 ETB required");

        if (method === 'bank_transfer' && !selectedBank) return toast.error("Please select a bank");
        if (method === 'bank_transfer' && !accountNumber) return toast.error("Account number is required");
        if (method !== 'bank_transfer' && !phone) return toast.error("Phone number is required");

        setIsSubmitting(true);
        try {
            // Try to find the correct bank code from the fetched list (using 'id' as 'bank_code')
            let bankCode = selectedBank?.id?.toString();
            
            if (method === 'telebirr') {
                const tb = banks.find(b => b.name.toLowerCase().includes('telebirr'));
                if (tb) bankCode = tb.id.toString();
            } else if (method === 'fana') {
                const fn = banks.find(b => b.name.toLowerCase().includes('fana'));
                if (fn) bankCode = fn.id.toString();
            }

            const details = method === 'bank_transfer' 
                ? { 
                    accountNumber, 
                    bankName: selectedBank?.name, 
                    bankCode: selectedBank?.code,
                    accountHolderName: accountHolder 
                }
                : { 
                    phoneNumber: phone,
                    bankCode: bankCode,
                    accountHolderName: accountHolder || 'Mobile Money Payout'
                };

            await requestPayout({
                amount: numAmount,
                payoutMethod: method,
                payoutDetails: details
            });
            
            toast.success("Withdrawal request submitted for approval");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Request failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Request Withdrawal">
            <div className="space-y-5 pt-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="p-4 bg-slate-900 rounded-2xl flex justify-between items-center text-white border border-white/5">
                    <div className="flex items-center gap-2">
                        <Wallet size={16} className="text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Available Balance</span>
                    </div>
                    <span className="text-xl font-black">{availableBalance.toLocaleString()} <span className="text-xs opacity-60">ETB</span></span>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount to Withdraw</label>
                    <Input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder="Min 100 ETB"
                        className="h-14 text-lg font-bold rounded-2xl bg-muted/20 border-border"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payout Method</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['bank_transfer', 'telebirr', 'fana'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => {
                                    setMethod(m);
                                    if (m !== 'bank_transfer') setSelectedBank(null);
                                }}
                                className={`p-3 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all flex flex-col items-center gap-1.5 ${
                                    method === m 
                                    ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' 
                                    : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'
                                }`}
                            >
                                {m === 'bank_transfer' ? <Landmark size={14} /> : <Phone size={14} />}
                                {m.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {method === 'bank_transfer' ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select Bank</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                        <Search size={14} />
                                    </div>
                                    <Input 
                                        placeholder="Search bank..." 
                                        value={bankSearch} 
                                        onChange={e => setBankSearch(e.target.value)} 
                                        className="pl-9 h-11 rounded-xl bg-muted/20"
                                    />
                                    {bankSearch && (
                                        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                                            {loadingBanks ? (
                                                <div className="p-4 text-center"><Loader2 className="animate-spin h-4 w-4 mx-auto" /></div>
                                            ) : filteredBanks.length > 0 ? (
                                                filteredBanks.map(bank => (
                                                    <button
                                                        key={bank.id}
                                                        className="w-full text-left px-4 py-2.5 hover:bg-primary/10 text-xs font-bold transition-colors border-b border-border last:border-0"
                                                        onClick={() => {
                                                            setSelectedBank(bank);
                                                            setBankSearch('');
                                                        }}
                                                    >
                                                        {bank.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-[10px] text-muted-foreground font-bold">No banks found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {selectedBank && (
                                    <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                                        <Landmark size={14} className="text-primary" />
                                        <span className="text-xs font-black text-primary">{selectedBank.name}</span>
                                        <button onClick={() => setSelectedBank(null)} className="ml-auto text-muted-foreground hover:text-red-500">
                                            <Search size={12} className="rotate-45" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <Input placeholder="Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="h-11 rounded-xl bg-muted/20" />
                            <Input placeholder="Account Holder Name" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} className="h-11 rounded-xl bg-muted/20" />
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Holder Name</label>
                                <Input placeholder="Full Name" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} className="h-11 rounded-xl bg-muted/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                                <Input placeholder="e.g. 0911223344" value={phone} onChange={e => setPhone(e.target.value)} className="h-11 rounded-xl bg-muted/20" />
                            </div>
                        </>
                    )}
                </div>

                <div className="pt-2">
                    <Button 
                        className="w-full h-14 primary-gradient text-white shadow-xl rounded-2xl font-black uppercase tracking-widest text-xs"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-5 w-5" />
                                <span>Processing...</span>
                            </div>
                        ) : "Submit Payout Request"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
