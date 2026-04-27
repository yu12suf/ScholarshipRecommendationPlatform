'use client';

import { useState, useEffect } from 'react';
import { Star, User, Clock, MessageSquare, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  studentName: string;
}

interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

interface CounselorReviewsProps {
  counselorId: number;
}

export const CounselorReviews = ({ counselorId }: CounselorReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [distribution, setDistribution] = useState<RatingDistribution | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!counselorId) {
      setLoading(false);
      return;
    }
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/counselors/${counselorId}/reviews`);
        console.log('[CounselorReviews] API Response:', res);
        
        // Data might be in res.data (if unwrapped by interceptor) 
        // or res.data.data (if not)
        const reviewData = res.data?.reviews ? res.data : res.data?.data;
        
        if (reviewData) {
          setReviews(reviewData.reviews || []);
          setDistribution(reviewData.ratingDistribution);
          setAverageRating(Number(reviewData.averageRating || 0));
          setTotalReviews(Number(reviewData.totalReviews || 0));
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [counselorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (totalReviews === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
        <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
        <p className="text-sm font-medium text-muted-foreground">No reviews yet for this counselor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-card border border-border p-8 rounded-3xl">
        <div className="text-center md:text-left space-y-2">
          <div className="text-5xl font-black text-foreground">{averageRating.toFixed(1)}</div>
          <div className="flex items-center justify-center md:justify-start gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={18}
                className={star <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}
              />
            ))}
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{totalReviews} Verified Reviews</p>
        </div>

        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = distribution ? distribution[rating as keyof RatingDistribution] : 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-4">
                <span className="text-xs font-bold w-4">{rating}</span>
                <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full primary-gradient transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground w-10 text-right">{Math.round(percentage)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Recent Feedback</h3>
        <div className="grid grid-cols-1 gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-muted/30 border border-border p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{review.studentName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <Clock size={12} />
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm leading-relaxed text-foreground/80 italic">
                  "{review.comment}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
