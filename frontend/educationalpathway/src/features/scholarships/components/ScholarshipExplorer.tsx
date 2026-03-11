'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui';
import { ScholarshipList } from './ScholarshipList';
import { motion } from 'framer-motion';

export const ScholarshipExplorer = () => {
  const [activeTab, setActiveTab] = useState('matched');

  return (
    <div className="space-y-12">

      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">

        <div className="space-y-2">
          <h1 className="h2">
            Scholarship Explorer
          </h1>

          <p className="text-body text-muted-foreground max-w-2xl">
            Discover and track the best financial opportunities tailored for
            your academic pathway.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <Button
            variant="outline"
            className="h-11 px-6 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter Results
          </Button>

          <Button
            className="h-11 px-6 primary-gradient text-primary-foreground"
          >
            Refresh Matches
          </Button>

        </div>

      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-border min-h-[48px]">

        <button
          onClick={() => setActiveTab('matched')}
          className={`pb-4 text-sm font-semibold relative transition
            ${
              activeTab === 'matched'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          Direct Matches

          {activeTab === 'matched' && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-4 text-sm font-semibold relative transition
            ${
              activeTab === 'saved'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          Saved (0)

          {activeTab === 'saved' && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('applied')}
          className={`pb-4 text-sm font-semibold relative transition
            ${
              activeTab === 'applied'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          Applied

          {activeTab === 'applied' && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"
            />
          )}
        </button>

      </div>

      {/* List */}
      <div className="pt-8">
        <ScholarshipList />
      </div>

    </div>
  );
};