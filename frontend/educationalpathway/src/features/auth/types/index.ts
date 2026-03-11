export type UserRole = 'student' | 'counselor' | 'admin';

export interface PreferredUniversity {
  name: string;
  country: string;
  preferenceLevel: 'High' | 'Medium' | 'Low';
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  isOnboarded: boolean;
  // Student Profile Fields
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  countryOfResidence?: string;
  city?: string;
  phoneNumber?: string;
  currentEducationLevel?: string;
  degreeSeeking?: string;
  fieldOfStudyInput?: string[];
  previousUniversity?: string;
  graduationYear?: number;
  gpa?: number;
  preferredDegreeLevel?: string[];
  preferredFundingType?: string;
  studyMode?: string;
  preferredCountries?: string[];
  preferredUniversities?: {
    name: string;
    country: string;
    preferenceLevel: 'High' | 'Medium' | 'Low';
  }[];
  [key: string]: any;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password?: string;
}
