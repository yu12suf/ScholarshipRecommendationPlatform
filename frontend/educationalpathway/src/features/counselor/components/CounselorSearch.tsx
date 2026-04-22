'use client';

import { Users, Search, Award, Calendar, Loader2 } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { useEffect, useState } from 'react';
import { getRecommendedCounselors } from '../api/counselor-api';
import { StudentBookingModal } from './StudentBookingModal';
import { toast } from 'react-hot-toast';

export const CounselorSearch = () => {
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const data = await getRecommendedCounselors();
        setCounselors(data);
      } catch (error) {
        console.error('Failed to fetch recommended counselors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCounselors();
  }, []);

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
          />

        </div>

        <Button
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
            <div
              key={counselor.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-muted transition gap-6"
            >

              {/* Left */}
              <div className="flex items-center gap-6">

                <div className="h-14 w-14 rounded-full primary-gradient flex items-center justify-center font-bold text-white shadow-md shrink-0">
                  {counselor?.name ? counselor.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'A'}
                </div>

                <div className="space-y-1">

                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-foreground hover:text-primary transition-colors cursor-pointer">
                      {counselor?.name || 'Anonymous Expert'}
                    </h3>
                    {(counselor?.recommendationScore || 0) >= 8 && (
                      <div className="px-2 py-0.5 bg-success/10 text-success text-[10px] font-black rounded-full uppercase tracking-tighter">
                        Top Match
                      </div>
                    )}
                  </div>

                  <p className="text-sm font-medium text-muted-foreground">
                    {counselor?.areasOfExpertise || 'Academic Expert'}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {counselor?.matchReasons?.slice(0, 2).map((reason: string, idx: number) => (
                      <span key={idx} className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                        <Award size={10} />
                        {reason}
                      </span>
                    ))}
                  </div>

                </div>

              </div>

              {/* Right */}
              <div className="flex items-center gap-4 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCounselor(counselor)}
                  className="h-10 px-6 font-semibold border-2 hover:bg-primary hover:text-white transition-all cursor-pointer"
                >
                  Book Session
                </Button>
              </div>

            </div>
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
