'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, ArrowRight, GraduationCap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getScholarships } from '@/features/scholarships/api/get-scholarships';
import { Scholarship } from '@/features/scholarships/types';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getScholarships({ query });
        setResults(data.slice(0, 5)); // Show only 5 in dropdown
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: number | string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/dashboard/student/scholarships/${id}`);
  };

  const handleViewAll = () => {
     setIsOpen(false);
     setQuery('');
     // Pass the query as a param to the scholarship explore page
     router.push(`/dashboard/scholarships?query=${encodeURIComponent(query)}`);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative group">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${loading ? 'text-primary' : 'text-muted-foreground group-focus-within:text-primary'}`}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search scholarships by name, country, or keyword..."
          className="w-full h-10 pl-10 pr-10 bg-muted/50 border border-transparent focus:border-primary/20 focus:bg-background rounded-lg text-sm transition-all focus:outline-none"
        />

        {query && (
          <button 
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg z-50 overflow-hidden"
          >
            {results.length > 0 ? (
              <div className="py-2">
                <div className="px-3 py-1 bg-muted/30">
                   <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Scholarships Found</span>
                </div>
                {results.map((scholarship) => (
                  <button
                    key={scholarship.id}
                    onClick={() => handleSelect(scholarship.id)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 text-left transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {scholarship.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate uppercase font-medium">
                        {scholarship.country || 'International'} • {scholarship.fundType || 'Scholarship'}
                      </p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                ))}
                
                <button
                  onClick={handleViewAll}
                  className="w-full px-4 py-2 border-t border-border bg-muted/10 hover:bg-muted/30 text-xs font-bold text-primary flex items-center justify-center gap-2 transition-colors"
                >
                  View all results for "{query}"
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ) : !loading ? (
              <div className="p-8 text-center">
                 <p className="text-sm text-muted-foreground">No scholarships found for "{query}"</p>
                 <p className="text-[10px] text-muted-foreground mt-1">Try keywords like your field of study or country interest.</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}