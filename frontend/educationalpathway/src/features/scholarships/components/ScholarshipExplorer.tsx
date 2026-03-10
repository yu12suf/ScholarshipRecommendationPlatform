'use client';

import { useState } from 'react';
import { Award, Filter } from 'lucide-react';
import { Button } from '@/components/ui';
import { ScholarshipList } from './ScholarshipList';
import { motion } from 'framer-motion';

export const ScholarshipExplorer = () => {
  const [activeTab, setActiveTab] = useState('matched');

  return (
    <div className="space-y-12">
      <div className="bg-white rounded-sm p-10 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-serif text-gray-900 tracking-tight">
            Scholarship Explorer
          </h1>
          <p className="text-gray-500 text-lg font-open-sans max-w-2xl">
            Discover and track the best financial opportunities tailored for your academic pathway.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-sm flex items-center gap-2 border-gray-200">
            <Filter className="h-4 w-4" /> Filter Results
          </Button>
          <Button className="h-12 px-6 rounded-sm bg-blue-600 hover:bg-blue-700 text-white border-none transition-colors">
            Refresh Matches
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-8 min-h-[48px]">
        <button 
          onClick={() => setActiveTab('matched')}
          className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'matched' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600 cursor-pointer'}`}
        >
          Direct Matches
          {activeTab === 'matched' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'saved' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600 cursor-pointer'}`}
        >
          Saved (0)
          {activeTab === 'saved' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
        </button>
        <button 
          onClick={() => setActiveTab('applied')}
          className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'applied' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600 cursor-pointer'}`}
        >
          Applied
          {activeTab === 'applied' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
        </button>
      </div>

      <div className="pt-8">
        <ScholarshipList />
      </div>
    </div>
  );
};
