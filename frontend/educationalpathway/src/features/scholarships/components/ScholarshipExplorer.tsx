'use client';

import { useState, useMemo } from 'react';
import { Filter, Sparkles, RefreshCcw, Search, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { ScholarshipList } from './ScholarshipList';
import { motion, AnimatePresence } from 'framer-motion';
import { ScholarshipFilters } from '../types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

export const ScholarshipExplorer = () => {
  const [activeTab, setActiveTab] = useState('matched');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Consolidate filter state
  const [filters, setFilters] = useState<ScholarshipFilters>({
    query: '',
    country: '',
    degree_level: '',
    fund_type: ''
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Force re-fetch triggered by state change
    setFilters({...filters}); 
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const updateFilter = (key: keyof ScholarshipFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      country: '',
      degree_level: '',
      fund_type: ''
    });
  };

  const hasActiveFilters = useMemo(() => {
    return filters.query || filters.country || filters.degree_level || filters.fund_type;
  }, [filters]);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Refined Header Section */}
      <motion.section 
        variants={item}
        className="relative overflow-hidden rounded-lg border border-border/60 bg-card p-10 md:p-12 shadow-sm"
      >
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-bl from-primary/5 via-transparent to-transparent opacity-50" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
               <Sparkles size={12} className="fill-primary" />
               Matched For Your Pathway
             </div>
             
             <h1 className="text-4xl font-bold tracking-tight text-foreground">
               Scholarship <span className="text-primary italic">Explorer</span>
             </h1>

             <p className="text-muted-foreground text-base leading-relaxed">
               Discover international opportunities curated specifically for your academic and financial background.
             </p>
          </div>

          <div className="flex items-center gap-4">
             <Button
               onClick={handleRefresh}
               disabled={isRefreshing}
               variant="ghost"
               className="h-12 w-12 rounded-lg hover:bg-muted text-muted-foreground border border-border/40"
             >
                <RefreshCcw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
             </Button>
          </div>
        </div>
      </motion.section>

      {/* Standardized Toolbar */}
      <motion.div variants={item} className="flex flex-col gap-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-border/50">
          {/* Tabs */}
          <div className="flex gap-8">
            {['matched', 'saved', 'applied'].map((id) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`group pb-4 text-sm font-bold relative transition-colors capitalize
                  ${activeTab === id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                `}
              >
                {id}
                {activeTab === id && (
                  <motion.div
                    layoutId="explorer-tab-dot"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Search Integrated Bar */}
          <div className="relative group flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              placeholder="Search by title or country..." 
              className="w-full h-11 pl-11 pr-4 bg-muted/30 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
            />
          </div>

          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? 'primary' : 'outline'}
            className={`h-11 px-6 rounded-lg flex items-center gap-2 font-bold text-xs transition-all ${showFilters ? 'primary-gradient text-white shadow-lg' : 'border-border/60'}`}
          >
            <Filter size={14} />
            FILTERS
            <ChevronDown size={14} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Filters Expansion */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-muted/20 border border-border/50 rounded-xl px-6 py-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Country</span>
                  <select 
                    value={filters.country}
                    onChange={(e) => updateFilter('country', e.target.value)}
                    className="w-full h-10 px-3 bg-card border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="">Any Country</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Degree Level</span>
                  <select 
                    value={filters.degree_level}
                    onChange={(e) => updateFilter('degree_level', e.target.value)}
                    className="w-full h-10 px-3 bg-card border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="">Any Level</option>
                    <option value="Bachelor">Bachelor's</option>
                    <option value="Master">Master's</option>
                    <option value="PhD">PhD / Doctorate</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Funding Type</span>
                  <select 
                    value={filters.fund_type}
                    onChange={(e) => updateFilter('fund_type', e.target.value)}
                    className="w-full h-10 px-3 bg-card border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="">Any Type</option>
                    <option value="Full">Full Funding</option>
                    <option value="Partial">Partial / Tuition Only</option>
                    <option value="Entrance">Entrance Scholarship</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={clearFilters}
                    className="text-xs font-bold text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors"
                  >
                    <X size={14} />
                    RESET ALL FILTERS
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Integrated Results */}
      <motion.div variants={item}>
        <ScholarshipList filters={filters} activeTab={activeTab} />
      </motion.div>

    </motion.div>
  );
};
