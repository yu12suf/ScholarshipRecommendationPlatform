import { Scholarship } from "../types";
import { Card, CardBody, Button, Badge } from "@/components/ui";
import { MapPin, ExternalLink, Info } from "lucide-react";
import Link from "next/link";

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

export const ScholarshipCard = ({ scholarship }: ScholarshipCardProps) => {
  const deadline = scholarship.deadline
    ? new Date(scholarship.deadline).toLocaleDateString()
    : "No deadline";

  const matchScore = scholarship.matchScore;
  const matchReason = scholarship.matchReason;
  const degreeLevels = scholarship.degreeLevels;

  return (
    <Card className="rounded-lg border-border bg-card hover: transition-all duration-200 overflow-hidden">
      <CardBody className="p-6 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground leading-tight line-clamp-2">
              {scholarship.title}
            </h3>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-small text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{scholarship.country || "International"}</span>
              </div>

              {matchScore !== undefined && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  {Math.round(matchScore)}% Match
                </div>
              )}
            </div>
          </div>

          <Badge
            variant="outline"
            className="px-2 py-1 text-[10px] font-medium border-border text-muted-foreground shrink-0"
          >
            {scholarship.fundType || "Scholarship"}
          </Badge>
        </div>

        {/* AI Reason Preview */}
        {matchReason && (
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
            <p className="text-[11px] text-primary leading-relaxed italic line-clamp-2">
              "AI: {matchReason}"
            </p>
          </div>
        )}

        {/* Details Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-label">Amount</span>
            <span className="text-sm font-semibold text-foreground">
              {scholarship.amount || "Varies"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-label">Deadline</span>
            <span className="text-sm font-medium text-foreground">
              {deadline}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href={`/dashboard/student/scholarships/${scholarship.id}`}
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors"
            >
              <Info className="h-4 w-4" />
              Details
            </Link>

            <a 
               href={scholarship.originalUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="flex-1 h-11 primary-gradient text-primary-foreground rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
            >
              Apply Now
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <p className="text-[10px] text-center text-muted-foreground italic">
            Redirects to original source provider 
          </p>
        </div>

      </CardBody>
    </Card>
  );
};
