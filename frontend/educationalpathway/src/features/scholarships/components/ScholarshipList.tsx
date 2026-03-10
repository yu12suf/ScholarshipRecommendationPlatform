"use client";

import { useState, useEffect } from "react";
import { Scholarship, ScholarshipFilters } from "../types";
import { getScholarships } from "../api/get-scholarships";
import { ScholarshipCard } from "./ScholarshipCard";
import { Loader2, Search, Filter } from "lucide-react";
import { Input, Button } from "@/components/ui";

export const ScholarshipList = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ScholarshipFilters>({});

  useEffect(() => {
    const fetchScholarships = async () => {
      setLoading(true);
      try {
        const data = await getScholarships(filters);
        setScholarships(data);
      } catch (error) {
        console.error("Failed to fetch scholarships", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, [filters]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setFilters({ ...filters, query: formData.get("query") as string });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            name="query"
            placeholder="Search by title, field of study, or keyword..."
            className="pl-12 h-12 rounded-sm border-gray-200 font-open-sans"
          />
        </div>
        <Button type="submit" className="h-12 px-8 bg-gray-900 hover:bg-black text-white rounded-sm">
          Search
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : scholarships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map((s, idx) => (
            <ScholarshipCard key={s.id ?? idx} scholarship={s} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-sm border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium font-open-sans">
            No scholarships found. Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
};
