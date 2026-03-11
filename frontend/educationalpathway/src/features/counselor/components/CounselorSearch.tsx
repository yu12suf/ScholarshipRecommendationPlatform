'use client';

import { Users, Search } from 'lucide-react';
import { Input, Button } from '@/components/ui';

export const CounselorSearch = () => {
  return (
    <div className="space-y-12">

      {/* Header */}
      <div className="bg-card border border-border rounded-sm p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="h2">
            Experts & Counselors
          </h1>

          <p className="text-body text-muted-foreground max-w-2xl">
            Connect with professionals who can guide your academic journey
            with expert insights and personalized mentorship.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search by name, expertise, or university..."
            className="pl-9 h-10"
          />

        </div>

        <Button
          size="icon"
          className="h-10 w-10 primary-gradient text-primary-foreground cursor-pointer"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Counselor List */}
      <div className="bg-card border border-border rounded-sm divide-y divide-border">

        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-6 hover:bg-muted transition"
          >

            {/* Left */}
            <div className="flex items-center gap-4">

              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
                {i === 1 ? 'YD' : i === 2 ? 'JS' : 'MA'}
              </div>

              <div className="space-y-1">

                <h3 className="font-semibold text-foreground">
                  Professional Counselor {i}
                </h3>

                <p className="text-small">
                  Expert in International Scholarships
                </p>

              </div>

            </div>

            {/* Right */}
            <Button
              variant="outline"
              className="h-9 cursor-pointer"
            >
              Book Session
            </Button>

          </div>
        ))}

      </div>

    </div>
  );
};