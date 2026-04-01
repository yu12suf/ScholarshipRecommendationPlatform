"use client";

import { useState } from "react";
import { AssessmentDashboard } from "@/features/assessments/components/AssessmentDashboard";
import { AssessmentTest } from "@/features/assessments/components/AssessmentTest";
import { AssessmentResultView } from "@/features/assessments/components/AssessmentResultView";

type View = "dashboard" | "test" | "result";

interface ProgressItem {
  id: number;
  testId: string;
  examType: string;
  difficulty: string;
  overallBand: number | string;
  createdAt: string;
}

export default function AssessmentPage() {
  const [view, setView] = useState<View>("dashboard");
  const [activeTest, setActiveTest] = useState<any>(null);
  const [selectedResult, setSelectedResult] = useState<ProgressItem | null>(null);

  if (view === "test" && activeTest) {
    return (
      <AssessmentTest
        examData={activeTest}
        onComplete={() => {
          setActiveTest(null);
          setView("dashboard");
        }}
      />
    );
  }

  if (view === "result" && selectedResult) {
    return (
      <AssessmentResultView
        testId={selectedResult.testId}
        examType={selectedResult.examType}
        difficulty={selectedResult.difficulty}
        onBack={() => {
          setSelectedResult(null);
          setView("dashboard");
        }}
      />
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <AssessmentDashboard
        onStartTest={(data) => {
          setActiveTest(data);
          setView("test");
        }}
        onViewResult={(item) => {
          setSelectedResult(item);
          setView("result");
        }}
      />
    </div>
  );
}
