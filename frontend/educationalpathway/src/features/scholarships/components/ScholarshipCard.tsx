import { Scholarship } from "../types";
import { Card, CardBody, Button, Badge } from "@/components/ui";
import { MapPin, ExternalLink } from "lucide-react";

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

export const ScholarshipCard = ({ scholarship }: ScholarshipCardProps) => {
  const deadline = scholarship.deadline
    ? new Date(scholarship.deadline).toLocaleDateString()
    : "No deadline";

  return (
    <Card className="rounded-lg border-border bg-card hover:shadow-md transition-all duration-200 overflow-hidden">
      <CardBody className="p-6 space-y-6">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground leading-tight line-clamp-2">
              {scholarship.title}
            </h3>

            <div className="flex items-center gap-2 text-small">
              <MapPin className="h-3.5 w-3.5" />
              <span>{scholarship.country || "International"}</span>
            </div>
          </div>

          <Badge
            variant="outline"
            className="text-label border-border text-muted-foreground"
          >
            {scholarship.fundType || "Scholarship"}
          </Badge>
        </div>

        {/* Details */}
        <div className="grid gap-4">

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

          <div className="flex flex-col">
            <span className="text-label">Eligibility</span>
            <span className="text-sm font-medium text-foreground truncate">
              {scholarship.degree_levels?.join(", ") || "All levels"}
            </span>
          </div>

        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">

          <Button className="w-full h-11 primary-gradient text-primary-foreground rounded-md">
            Apply Now
          </Button>

          <a
            href={scholarship.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
          >
            Original source
            <ExternalLink className="h-3 w-3" />
          </a>

        </div>

      </CardBody>
    </Card>
  );
};