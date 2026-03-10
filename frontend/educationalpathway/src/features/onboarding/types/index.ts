export interface StudentExtractedData {
  academic_history: Array<{
    institution: string;
    degree: string;
    year: string | number;
  }>;
  skills: string[];
  gpa: number;
}

export interface CounselorExtractedData {
  bio: string;
  areas_of_expertise: string[];
  years_of_experience: number;
}

export type ExtractedData = StudentExtractedData | CounselorExtractedData;

export interface OnboardingState {
  step: number;
  loading: boolean;
  files: { [key: string]: File };
  extractedData: ExtractedData | null;
}
