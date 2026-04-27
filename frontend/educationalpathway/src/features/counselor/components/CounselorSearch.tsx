'use client';

import { Users, Search, Award, Calendar, Loader2, Star } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { useEffect, useState } from 'react';
import { getRecommendedCounselors, getCounselors } from '../api/counselor-api';
import { StudentBookingModal } from './StudentBookingModal';
import { CounselorReviews } from './CounselorReviews';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const CounselorCard = ({ counselor, onBook }: { counselor: any; onBook: (c: any) => void }) => {
  const [showReviews, setShowReviews] = useState(false);

  return (
    <div className="divide-y divide-border/50">
      <div
        className="flex flex-col md:flex-row md:items-center justify-between p-8 hover:bg-muted/30 transition gap-8"
      >
        {/* Left */}
        <div className="flex items-start gap-6">
          <div className="h-16 w-16 rounded-2xl primary-gradient flex items-center justify-center font-black text-white shadow-lg shrink-0 text-xl">
            {counselor?.name ? counselor.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'A'}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-black text-xl text-foreground group-hover:text-primary transition-colors">
                {counselor?.name || 'Anonymous Expert'}
              </h3>
              {counselor?.recommendationScore ? (
                <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/20">
                  {Math.round(counselor.recommendationScore)}% Match
                </div>
              ) : (counselor?.recommendationScore || 0) >= 8 && (
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-500/20">
                  Top Match
                </div>
              )}
            </div>

            <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
              {counselor?.areasOfExpertise || 'Academic Expert'}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-xl border border-amber-500/20">
                <Star size={14} className="fill-amber-500" />
                <span className="text-xs font-black">{Number(counselor?.rating || 0).toFixed(1)}</span>
                <span className="text-[10px] opacity-60 font-bold uppercase ml-1">({counselor?.totalReviews || 0} reviews)</span>
              </div>

              {counselor?.matchReasons?.slice(0, 2).map((reason: string, idx: number) => (
                <span key={idx} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                  <Award size={12} />
                  {reason}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Button
            variant="ghost"
            onClick={() => setShowReviews(!showReviews)}
            className="h-12 px-6 font-black uppercase tracking-widest text-[10px] border border-border hover:bg-muted"
          >
            {showReviews ? 'Hide Reviews' : 'View Reviews'}
          </Button>
          <Button
            onClick={() => onBook(counselor)}
            className="h-12 px-8 font-black uppercase tracking-widest text-[10px] primary-gradient text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            Book Session
          </Button>
        </div>
      </div>

      {/* Reviews Section */}
      <AnimatePresence>
        {showReviews && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-muted/10"
          >
            <div className="p-8 md:px-12 border-t border-border/50">
              <CounselorReviews counselorId={counselor.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CounselorSearch = () => {
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal State
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);

  const fetchCounselors = async (search = '') => {
    setLoading(true);
    try {
      // Fetch recommendations first if student and NO search query
      let recommended: any[] = [];
      if (!search) {
        try {
          recommended = await getRecommendedCounselors();
        } catch (e) {
          console.error('Failed to fetch recommendations', e);
        }
      }

      // Fetch counselors from the directory
      const data = await getCounselors(search ? { search } : {});
      const all = data.rows || [];

      // Merge or prioritize recommended ones
      let merged = [...recommended];
      const recommendedIds = new Set(recommended.map(c => c.id));
      
      all.forEach((c: any) => {
        if (!recommendedIds.has(c.id)) {
          merged.push(c);
        }
      });

      setCounselors(merged);
    } catch (error) {
      console.error('Failed to fetch counselors:', error);
      toast.error('Failed to load counselors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounselors();
  }, []);

  const handleSearch = () => {
    fetchCounselors(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-12">

      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="h2 flex items-center gap-3">
            Experts & Counselors
          </h1>

          <p className="text-body text-muted-foreground max-w-2xl">
            Connect with professionals who can guide your academic journey
            with expert insights and personalized mentorship.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search by name, expertise, or university..."
            className="pl-9 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
          />

        </div>

        <Button
          onClick={handleSearch}
          size="icon"
          className="h-10 w-10 primary-gradient text-primary-foreground cursor-pointer"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Counselor List */}
      <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">

        {loading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">
            Searching for expert matches...
          </div>
        ) : counselors?.length > 0 ? (
          counselors.map((counselor) => (
            <CounselorCard 
              key={counselor.id} 
              counselor={counselor} 
              onBook={setSelectedCounselor} 
            />
          ))
        ) : (
          <div className="p-24 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold">No Counselor Matches Found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              We couldn't find counselors matching your precise profile yet. Try broadening your research areas or interests.
            </p>
          </div>
        )}

      </div>

      {/* Booking Modal */}
      {selectedCounselor && (
        <StudentBookingModal 
          counselor={selectedCounselor}
          onClose={() => setSelectedCounselor(null)}
        />
      )}

    </div>
  );
};
