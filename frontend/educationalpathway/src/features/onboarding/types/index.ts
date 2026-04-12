export interface ExtractedPersonalInfo {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  countryOfResidence?: string;
  city?: string;
}

export interface ExtractedAcademicInfo {
  currentEducationLevel?: string;
  degreeSeeking?: string;
  fieldOfStudy?: string[];
  previousUniversity?: string;
  graduationYear?: number;
  gpa?: number;
  languageTestType?: string;
  testScore?: string;
  researchArea?: string;
  proposedResearchTopic?: string;
}

export interface ExtractedPreferenceInfo {
  preferredDegreeLevel?: string[];
  preferredFundingType?: string;
  studyMode?: string;
  preferredCountries?: string[];
  preferredUniversities?: Array<{ name: string; country: string }>;
  familyIncomeRange?: string;
  needsFinancialSupport?: boolean;
}

export interface ExtractedWorkExperience {
  organizationName?: string;
  jobTitle?: string;
  yearsOfExperience?: number;
}

export interface StudentExtractedData {
  personalInfo?: ExtractedPersonalInfo;
  academicInfo?: ExtractedAcademicInfo;
  preferenceInfo?: ExtractedPreferenceInfo;
  workExperience?: ExtractedWorkExperience[];
  academicHistory?: Array<{
    institution: string;
    degree: string;
    year: string | number;
  }>;
  skills?: string[];
  highSchool?: string;
  academicStatus?: string;
  gpa?: number;
  // Legacy fields for backward compatibility
  academic_history?: Array<{
    institution: string;
    degree: string;
    year: string | number;
  }>;
  work_experience?: string | null;
  high_school?: string | null;
}

export interface CounselorExtractedData {
  bio?: string;
  areas_of_expertise?: string[];
  years_of_experience?: number;
}

export type ExtractedData = StudentExtractedData | CounselorExtractedData;

export interface OnboardingState {
  step: number;
  loading: boolean;
  files: { [key: string]: File };
  extractedData: ExtractedData | null;
}
