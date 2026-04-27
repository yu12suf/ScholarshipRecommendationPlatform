'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Model';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Star, Loader2, AlertCircle } from 'lucide-react';
import { reviewAndConfirmBooking } from '@/features/counselor/api/counselor-api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/providers/auth-context';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: number;
    counselorName: string;
    onSuccess: () => void;
}

export const ReviewModal = ({ isOpen, onClose, bookingId, counselorName, onSuccess }: ReviewModalProps) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (user?.role !== 'student') {
            toast.error('Only students can confirm and review completed sessions.');
            return;
        }

        setIsSubmitting(true);
        try {
            await reviewAndConfirmBooking(bookingId, { rating, comment });
            toast.success("Session confirmed and funds released!");
            onSuccess();
            onClose();
        } catch (error: any) {
            const message = error.response?.data?.message || error.response?.data?.error || "";
            if (message.toLowerCase().includes("already been submitted")) {
                toast.success("Review already submitted.");
                onSuccess();
                onClose();
            } else {
                toast.error(message || "Failed to confirm session.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Session Completion Review"
        >
            <div className="space-y-6 pt-4">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-3">
                    <AlertCircle className="text-primary mt-1" size={18} />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        By confirming, you agree that the session with <span className="font-bold text-foreground">{counselorName}</span> was completed successfully. This will release the escrowed funds to the counselor.
                    </p>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Rate your experience</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`transition-all duration-300 transform hover:scale-110 ${
                                    rating >= star ? 'text-amber-400' : 'text-muted/30'
                                }`}
                            >
                                <Star 
                                    size={32} 
                                    fill={rating >= star ? 'currentColor' : 'none'} 
                                    strokeWidth={2.5}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Feedback (Optional)</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="How did the session go? What helped you the most?"
                        className="w-full min-h-[100px] bg-muted/50 border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button 
                        variant="ghost" 
                        onClick={onClose} 
                        className="flex-1 h-12"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="flex-1 h-12 primary-gradient text-white shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : "Confirm & Release Funds"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
