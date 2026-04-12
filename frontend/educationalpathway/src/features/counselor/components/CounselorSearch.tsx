'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Award, Calendar, Clock, Star } from 'lucide-react';
import { Input, Button } from '@/components/ui';
import { getRecommendedCounselors } from '../api/counselor-api';
import { BookingModal, BookingSuccessModal } from './BookingModal';
import toast from 'react-hot-toast';

interface Counselor {
  id: number;
  name: string;
  areasOfExpertise: string;
  bio?: string;
  rating: number;
  totalSessions: number;
  yearsOfExperience?: number;
  qualification?: string;
  university?: string;
  recommendationScore?: number;
  matchReasons?: string[];
}

export const CounselorSearch = () => {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [successBooking, setSuccessBooking] = useState<any>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const data = await getRecommendedCounselors();
        if (data && Array.isArray(data)) {
          setCounselors(data);
        }
      } catch (error) {
        console.error('Failed to fetch recommended counselors:', error);
        toast.error('Failed to load counselors');
      } finally {
        setLoading(false);
      }
    };
    fetchCounselors();
  }, []);

  const handleBookSession = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (booking: any) => {
    setSuccessBooking(booking);
    setSuccessModalOpen(true);
    toast.success('Session booked successfully!');
  };

  const filteredCounselors = searchQuery
    ? counselors.filter(c => 
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.areasOfExpertise?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : counselors;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="space-y-3">
          <h1 className="h1 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Experts & Counselors
          </h1>
          <p className="text-body text-muted-foreground max-w-2xl">
            Connect with verified scholarship experts who can guide your academic journey. 
            Get personalized mentorship for your international scholarship applications.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by name, expertise, or university..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 text-lg bg-card border-border rounded-xl"
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Searching...' : `${filteredCounselors.length} counselor(s) available`}
        </p>
      </div>

      {/* Counselor List */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Finding expert matches...</p>
          </div>
        ) : filteredCounselors.length > 0 ? (
          filteredCounselors.map((counselor) => (
            <div
              key={counselor.id}
              className="flex flex-col lg:flex-row lg:items-center justify-between p-6 hover:bg-muted/30 transition-all duration-200 gap-6"
            >
              {/* Left - Profile */}
              <div className="flex items-start gap-5 flex-1">
                {/* Avatar */}
                <div className="h-16 w-16 rounded-full primary-gradient flex items-center justify-center font-bold text-white text-xl shadow-lg shrink-0">
                  {counselor?.name ? counselor.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'E'}
                </div>

                {/* Info */}
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-xl text-foreground">
                      {counselor?.name || 'Expert Counselor'}
                    </h3>
                    {(counselor?.recommendationScore || 0) >= 8 && (
                      <span className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full uppercase tracking-wider">
                        Top Match
                      </span>
                    )}
                    {counselor.rating > 0 && (
                      <div className="flex items-center gap-1 text-warning">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-semibold text-sm">{counselor.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-muted-foreground font-medium">
                    {counselor.areasOfExpertise || 'Scholarship & Academic Expert'}
                  </p>

                  {counselor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-xl">
                      {counselor.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 flex-wrap text-sm">
                    {counselor.totalSessions > 0 && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {counselor.totalSessions} sessions
                      </span>
                    )}
                    {counselor.yearsOfExperience && (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {counselor.yearsOfExperience} years exp.
                      </span>
                    )}
                  </div>

                  {/* Match Reasons */}
                  {counselor.matchReasons && counselor.matchReasons.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {counselor.matchReasons.slice(0, 3).map((reason, idx) => (
                        <span 
                          key={idx} 
                          className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10"
                        >
                          <Award className="h-3 w-3" />
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right - Action */}
              <div className="flex items-center gap-3 shrink-0 lg:ml-4">
                <Button
                  onClick={() => handleBookSession(counselor)}
                  className="h-12 px-8 font-bold primary-gradient text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Session
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
            <h3 className="text-xl font-bold mb-2">No Counselors Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery 
                ? `No counselors found matching "${searchQuery}". Try a different search term.`
                : 'No verified counselors are currently available. Please check back later.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedCounselor && (
        <BookingModal
          counselor={{
            id: selectedCounselor.id,
            name: selectedCounselor.name,
            areasOfExpertise: selectedCounselor.areasOfExpertise
          }}
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedCounselor(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Success Modal */}
      <BookingSuccessModal
        booking={successBooking}
        isOpen={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          setSuccessBooking(null);
        }}
      />
    </div>
  );
};