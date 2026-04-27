"use client";

import { useState, useEffect } from "react";
import { Scholarship, ScholarshipFilters } from "../types";
import { getScholarships, exploreScholarships } from "../api/get-scholarships";
import { getTrackedScholarships } from "../api/tracking";
import { ScholarshipCard } from "./ScholarshipCard";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

interface ScholarshipListProps {
  filters: ScholarshipFilters;
  activeTab: string;
}

export const ScholarshipList = ({ filters, activeTab }: ScholarshipListProps) => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScholarships = async () => {
      setLoading(true);

      try {
        let data;
        if (activeTab === 'explore') {
          data = await exploreScholarships(filters);
        } else if (activeTab === 'matched') {
          data = await getScholarships(filters);
        } else {
          // Fetch tracked scholarships from backend
          const response = await getTrackedScholarships();
          const tracked = response.status === 'success' ? response.data : response;
          
          if (activeTab === 'saved') {
            // Include both NOT_STARTED and WATCHING for parity
            data = tracked.filter((item: any) => ['NOT_STARTED', 'WATCHING'].includes(item.status)).map((item: any) => ({
              ...item.scholarship,
              tracking: { id: item.id, status: item.status }
            }));
          } else if (activeTab === 'applied') {
            // Include APPLIED, SUBMITTED, and ACCEPTED
            data = tracked.filter((item: any) => ['APPLIED', 'SUBMITTED', 'ACCEPTED'].includes(item.status)).map((item: any) => ({
              ...item.scholarship,
              tracking: { id: item.id, status: item.status }
            }));
          }
        }
        
        setScholarships(data || []);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch scholarships", err);
        setError(err.response?.data?.message || "Failed to load matching scholarships.");
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, [filters, activeTab]);

  return (
    <div className="space-y-6">
      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Finding Matches...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-destructive/5 rounded-xl border border-destructive/10">
          <p className="text-destructive font-medium mb-4">{error}</p>
          {error.includes("onboarded") && (
            <Button 
               onClick={() => window.location.href = '/dashboard/student/profile'}
               className="primary-gradient text-primary-foreground font-bold rounded-xl"
            >
              Complete Your Profile
            </Button>
          )}
        </div>
      ) : scholarships.length > 0 ? (
        /* Results Grid */
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {scholarships.map((s, idx) => (
              <ScholarshipCard
                key={s.id || `card-${idx}`}
                scholarship={s}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <div className="text-center py-24 bg-muted/20 rounded-xl border-2 border-dashed border-border/50 px-4">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
             <Search className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-bold text-lg mb-1">No Matching Scholarships</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto text-balance">
            Try adjusting your search filters or completing more of your profile to find more opportunities.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            variant="ghost" 
            className="mt-6 text-xs font-bold text-primary hover:bg-primary/5"
          >
            REFRESH DISCOVERY
          </Button>
        </div>
      )}
    </div>
  );
};
