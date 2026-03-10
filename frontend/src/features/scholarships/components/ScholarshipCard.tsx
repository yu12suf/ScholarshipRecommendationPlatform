import { Scholarship } from '../types';
import { Card, CardBody, Button, Badge } from '@/components/ui';
import { Calendar, MapPin, GraduationCap, DollarSign, ExternalLink } from 'lucide-react';

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

export const ScholarshipCard = ({ scholarship }: ScholarshipCardProps) => {
  const deadline = scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'No deadline';

  return (
    <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-4xl border-gray-100/50 overflow-hidden">
      <CardBody className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{scholarship.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{scholarship.country || 'International'}</span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
            {scholarship.fundType || 'Scholarship'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-gray-700">{scholarship.amount || 'Varies'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="text-gray-700 font-medium">{deadline}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <span className="text-gray-700 font-medium truncate">{scholarship.degree_levels?.join(', ') || 'All levels'}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <a 
            href={scholarship.originalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center px-4 py-2 text-xs font-bold border-2 border-primary/20 bg-transparent text-primary hover:bg-primary/5 rounded-sm transition-all"
          >
            View Original <ExternalLink className="h-3 w-3 ml-1" />
          </a>
          <Button className="flex-1 text-xs scholarship-gradient border-none">
            Apply Now
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
