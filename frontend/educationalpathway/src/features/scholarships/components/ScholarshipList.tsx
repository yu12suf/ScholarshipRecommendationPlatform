"use client";

import { useState, useEffect } from "react";
import { Scholarship, ScholarshipFilters } from "../types";
import { getScholarships } from "../api/get-scholarships";
import { ScholarshipCard } from "./ScholarshipCard";
import { Loader2, Search } from "lucide-react";
import { Input, Button } from "@/components/ui";

export const ScholarshipList = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ScholarshipFilters>({});

  useEffect(() => {
    const fetchScholarships = async () => {
      setLoading(true);

      try {
        const data = await getScholarships(filters);
        setScholarships(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch scholarships", err);
        setError(err.response?.data?.message || "Failed to load matching scholarships.");
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, [filters]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    setFilters({
      ...filters,
      query: formData.get("query") as string,
    });
  };

  return (
    <div className="space-y-6">

      {/* Search */}
      <form
  onSubmit={handleSearch}
  className="flex items-center gap-2 max-w-md"
>
  <div className="relative flex-1">

    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

    <Input
      name="query"
      placeholder="Search scholarships..."
      className="pl-9 h-10"
    />

  </div>

  <Button
    type="submit"
    size="icon"
    className="h-10 w-10 primary-gradient text-primary-foreground cursor-pointer"
  >
    <Search className="h-4 w-4" />
  </Button>
</form>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">

          <Loader2 className="h-10 w-10 animate-spin text-primary" />

        </div>
      ) : error ? (
        <div className="text-center py-20 bg-destructive/5 rounded-lg border border-destructive/20">
          <p className="text-destructive font-medium mb-4">{error}</p>
          {error.includes("onboarded") && (
            <Button 
               onClick={() => window.location.href = '/onboarding'}
               className="primary-gradient text-primary-foreground"
            >
              Complete Profile
            </Button>
          )}
        </div>
      ) : scholarships.length > 0 ? (

        /* Results Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {scholarships.map((s, idx) => (
            <ScholarshipCard
              key={s.id ?? idx}
              scholarship={s}
            />
          ))}

        </div>

      ) : (

        /* Empty State */
        <div className="text-center py-20 bg-muted rounded-lg border-2 border-dashed border-border">

          <p className="text-muted-foreground font-medium">
            No scholarships found. Try adjusting your search or filters.
          </p>

        </div>

      )}

    </div>
  );
};
