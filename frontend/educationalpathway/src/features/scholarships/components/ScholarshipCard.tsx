import { Scholarship } from '../types';
import { Card, CardBody, Button, Badge } from '@/components/ui';
import { Calendar, MapPin, GraduationCap, DollarSign, ExternalLink } from 'lucide-react';

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

export const ScholarshipCard = ({ scholarship }: ScholarshipCardProps) => {
  const deadline = scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'No deadline';

  return (
    <Card className="hover:shadow-lg transition-all duration-200 rounded-sm border-gray-200 overflow-hidden bg-white">
      <CardBody className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h3 className="text-xl font-serif text-gray-900 leading-tight line-clamp-2">
              {scholarship.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-open-sans">
              <MapPin className="h-3.5 w-3.5" />
              <span>{scholarship.country || 'International'}</span>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold border-gray-200 text-gray-500 rounded-sm">
            {scholarship.fundType || 'Scholarship'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400 font-bold leading-none mb-1.5">Amount</span>
            <span className="font-semibold text-gray-800 text-sm">{scholarship.amount || 'Varies'}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400 font-bold leading-none mb-1.5">Deadline</span>
            <span className="text-gray-800 font-medium text-sm">{deadline}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-400 font-bold leading-none mb-1.5">Eligibility</span>
            <span className="text-gray-800 font-medium text-sm truncate">{scholarship.degree_levels?.join(', ') || 'All levels'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-sm h-11 transition-colors">
            Apply Now
          </Button>
          <a
            href={scholarship.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Original source <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </CardBody>
    </Card>
  );
};
