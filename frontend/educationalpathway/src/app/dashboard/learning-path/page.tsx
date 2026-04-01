import { LearningPathView } from "@/features/english-learning/components/LearningPath/LearningPathView";

export default function LearningPathPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="h1">English Learning Path</h1>
        <p className="text-muted-foreground mt-2">
          Your personalized journey to master the English language based on your assessment results.
        </p>
      </div>

      <LearningPathView />
    </div>
  );
}
