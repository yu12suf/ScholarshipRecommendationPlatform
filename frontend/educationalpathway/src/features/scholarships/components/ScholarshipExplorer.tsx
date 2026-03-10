'use client';

import { useState } from 'react';
import { Award, Filter } from 'lucide-react';
import { Button } from '@/components/ui';
import { ScholarshipList } from './ScholarshipList';

export const ScholarshipExplorer = () => {
  const [activeTab, setActiveTab] = useState('matched');

  return (
    <div className="space-y-12">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             <div className="p-2 bg-secondary/10 rounded-2xl">
                <Award className="h-10 w-10 text-secondary" />
             </div>
             Scholarship Explorer
          </h1>
          <p className="text-gray-600 text-lg font-medium">Discover and track the best financial opportunities for your academic career.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="xl" className="h-14 px-8 bg-white font-black rounded-2xl border-2 border-gray-100 flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filters
          </Button>
          <Button size="xl" className="h-14 px-8 font-black rounded-2xl shadow-xl shadow-primary/20 scholarship-gradient border-none">
            Update Discovery
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('matched')}
          className={`px-6 py-4 text-sm font-bold transition-all relative ${activeTab === 'matched' ? 'text-primary' : 'text-slate-500 hover:text-gray-600'}`}
        >
          Matches
          {activeTab === 'matched' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`px-6 py-4 text-sm font-bold transition-all relative ${activeTab === 'saved' ? 'text-primary' : 'text-slate-500 hover:text-gray-600'}`}
        >
          Saved (0)
          {activeTab === 'saved' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('applied')}
          className={`px-6 py-4 text-sm font-bold transition-all relative ${activeTab === 'applied' ? 'text-primary' : 'text-slate-500 hover:text-gray-600'}`}
        >
          My Apps
          {activeTab === 'applied' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
        </button>
      </div>

      <ScholarshipList />
    </div>
  );
};
