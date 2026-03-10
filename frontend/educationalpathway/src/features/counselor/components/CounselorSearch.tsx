'use client';

import { Users } from 'lucide-react';
import { Card, CardBody, Input, Button } from '@/components/ui';

export const CounselorSearch = () => {
  return (
    <div className="space-y-12">
      <div className="bg-white rounded-sm p-10 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-serif text-gray-900 tracking-tight">
            Experts & Counselors
          </h1>
          <p className="text-gray-500 text-lg font-open-sans max-w-2xl">
            Connect with professionals who can guide your academic journey with expert insights and personalized mentorship.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Input 
            placeholder="Search by name, expertise, or university..." 
            className="h-12 rounded-sm border-gray-200 font-open-sans"
          />
        </div>
        <Button className="h-12 px-8 bg-gray-900 hover:bg-black text-white rounded-sm">
          Search Counselors
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="hover:shadow-lg transition-all duration-200 rounded-sm border-gray-200 bg-white">
            <CardBody className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-orange-600">
                    {i === 1 ? 'YD' : i === 2 ? 'JS' : 'MA'}
                  </span>
                </div>
                
                <h3 className="text-xl font-serif text-gray-900 mb-2">
                  Professional Counselor {i}
                </h3>
                
                <div className="space-y-1 mb-8">
                  <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider block">Specialization</span>
                  <p className="text-sm text-gray-600 font-open-sans">Expert in International Scholarships</p>
                </div>

                <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-sm transition-colors">
                  Book Session
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
