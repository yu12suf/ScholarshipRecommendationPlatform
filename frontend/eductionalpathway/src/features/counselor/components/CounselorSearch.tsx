'use client';

import { Users } from 'lucide-react';
import { Card, CardBody, Input, Button } from '@/components/ui';

export const CounselorSearch = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          Experts & Counselors
        </h1>
        <p className="text-gray-600 mt-1 font-medium">Connect with professionals who can guide your academic journey.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input 
            placeholder="Search by name, expertise, or university..." 
            className="bg-white"
          />
        </div>
        <Button className="font-bold scholarship-gradient">Search Counselors</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow rounded-xl">
            <CardBody className="p-6 text-center">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Professional Counselor {i}</h3>
              <p className="text-sm text-gray-600 font-medium mb-4">Expert in International Scholarships</p>
              <Button variant="outline" className="w-full font-bold border-2">Book Session</Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
