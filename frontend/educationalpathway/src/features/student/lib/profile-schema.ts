import { z } from "zod";

const GENDER_VALUES = ["Male", "Female", "Other", "Prefer not to say"] as const;
const EDUCATION_LEVELS = ["High School", "Bachelor's", "Master's", "PhD"] as const;
const DEGREE_VALUES = ["Bachelor's", "Master's", "PhD"] as const;
const FUNDING_TYPES = ["Fully Funded", "Partially Funded", "Tuition Only"] as const;
const STUDY_MODES = ["On-Campus", "Online", "Hybrid"] as const;
const TEST_TYPES = ["IELTS", "TOEFL", "Duolingo", "None"] as const;
const PREFERENCE_LEVELS = ["High", "Medium", "Low"] as const;

export const profileSchema = z.object({
  // Step 1: Personal Info
  fullName: z.string().min(2, "Full name is required"),
  gender: z.enum(GENDER_VALUES, { message: "Please select a gender" }),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date of birth",
  }),
  nationality: z.string().min(1, "Nationality is required"),
  countryOfResidence: z.string().min(1, "Country of residence is required"),
  city: z.string().min(1, "City is required"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address"),

  // Step 2: Academic Background
  currentEducationLevel: z.enum(EDUCATION_LEVELS, { message: "Select your education level" }),
  degreeSeeking: z.enum(DEGREE_VALUES, { message: "Select the degree you are seeking" }),
  fieldOfStudyInput: z.array(z.string()).min(1, "Select at least one field of study"),
  previousUniversity: z.string().min(1, "Previous university is required"),
  graduationYear: z.number().int().min(1900).max(new Date().getFullYear() + 10),
  gpa: z.number().min(0).max(10),

  // Step 3: Scholarship Preferences
  preferredDegreeLevel: z.array(z.string()).min(1, "Select at least one degree level"),
  preferredFundingType: z.enum(FUNDING_TYPES),
  studyMode: z.enum(STUDY_MODES),

  // Step 4: Preferred Countries
  targetLocation: z.string().optional(),
  preferredCountries: z.array(z.string()).min(1, "Select at least one country"),

  // Step 5: Preferred Universities
  preferredUniversities: z.array(z.object({
    name: z.string(),
    country: z.string(),
    preferenceLevel: z.enum(PREFERENCE_LEVELS),
  })).min(1, "Select at least one university"),

  // Step 6: Language Qualification
  languageTestType: z.enum(TEST_TYPES),
  testScore: z.string().optional(),

  // Step 7: Work Experience
  workExperience: z.array(z.object({
    organizationName: z.string(),
    jobTitle: z.string(),
    yearsOfExperience: z.number().min(0),
  })).optional(),

  // Step 8: Research Interest
  researchArea: z.string().optional(),
  proposedResearchTopic: z.string().optional(),

  // Step 9: Financial Need
  familyIncomeRange: z.string().optional(),
  needsFinancialSupport: z.boolean().default(false),

  // Step 10: Documents
  documents: z.object({
    cv: z.any().optional(),
    transcript: z.any().optional(),
    degreeCertificate: z.any().optional(),
    languageCertificate: z.any().optional(),
  }).optional(),

  // Step 11: Notification Preferences
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    inSystem: z.boolean().default(true),
  }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
