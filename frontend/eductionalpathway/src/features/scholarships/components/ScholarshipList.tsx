'use client';

import { useState, useEffect } from 'react';
import { Scholarship, ScholarshipFilters } from '../types';
import { getScholarships } from '../api/get-scholarships';
import { ScholarshipCard } from './ScholarshipCard';
import { Loader2, Search, Filter } from 'lucide-react';
import { Input, Button } from '@/components/ui';

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
        console.error('Failed to fetch scholarships', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScholarships();
  }, [filters]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setFilters({ ...filters, query: formData.get('query') as string });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            name="query"
            placeholder="Search scholarships by title or description..." 
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
        <Button variant="outline" type="button">
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : scholarships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map((s) => (
            <ScholarshipCard key={s.id} scholarship={s} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-muted-foreground font-medium">No scholarships found.</p>
        </div>
      )}
    </div>
  );
};
