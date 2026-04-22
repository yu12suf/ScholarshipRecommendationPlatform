import { Scholarship } from "../types";
import { Card, CardBody, Button, Badge } from "@/components/ui";
import { MapPin, ExternalLink, Info, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

export const ScholarshipCard = ({ scholarship }: ScholarshipCardProps) => {
  const deadline = scholarship.deadline
    ? new Date(scholarship.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : "No deadline";

  const matchScore = scholarship.matchScore;
  const matchReason = scholarship.matchReason;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      whileHover={{ y: -6, scale: 1.02, zIndex: 10 }}
      transition={{ 
        duration: 0.2, 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }}
      className="h-full"
    >
      <Card className="rounded-2xl border border-border/50 bg-card hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
        <CardBody className="p-6 flex flex-col h-full">

          {/* Header */}
          <div className="flex justify-between items-start mb-4 gap-4">
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {scholarship.title}
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80">
                  <MapPin className="h-3 w-3" />
                  <span>{scholarship.country || "International"}</span>
                </div>

                {matchScore !== undefined && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest">
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
              className="px-2 py-0.5 rounded-md text-[9px] font-bold border-border/60 text-muted-foreground bg-muted/30 uppercase tracking-tighter shrink-0"
            >
              {scholarship.fundType || "Scholarship"}
            </Badge>
          </div>

          {/* AI Reason Preview */}
          {matchReason && (
            <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 mb-6 flex gap-2 items-start">
              <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />
              <p className="text-[11px] font-medium text-primary/80 leading-relaxed italic line-clamp-2">
                {matchReason}
              </p>
            </div>
          )}

          {/* Details Summary */}
          <div className="grid grid-cols-2 gap-4 mt-auto mb-6">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Amount</span>
              <span className="text-sm font-black text-foreground">
                {scholarship.amount || "Varies"}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">Deadline</span>
              <span className="text-sm font-bold text-foreground">
                {deadline}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href={`/dashboard/student/scholarships/${scholarship.id}`}
                className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-muted/50 hover:bg-muted text-foreground text-xs font-bold transition-all border border-border/20"
              >
                <Info className="h-3.5 w-3.5" />
                DETAILS
              </Link>

              <a 
                 href={scholarship.originalUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex-1 h-10 primary-gradient text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all"
              >
                APPLY
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <p className="text-[9px] text-center font-medium text-muted-foreground/40 whitespace-nowrap">
              Secure redirect to official source
            </p>
          </div>

        </CardBody>
      </Card>
    </motion.div>
  );
};
