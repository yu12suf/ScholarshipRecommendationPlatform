export interface CreateCounselorDto {
    bio?: string;
    areasOfExpertise?: string;
    hourlyRate?: number;
    yearsOfExperience?: number;
    credentials?: CredentialDto[];
    qualifications?: string[];
    specializations?: string[];
    supportedLanguages?: string[];
    consultationModes?: ConsultationMode[];
    currentUniversity?: string;
    currentDegreeLevel?: "bachelors" | "masters";
    availabilitySummary?: string;
    isOnboarded?: boolean;
    documentUrl?: string;
    idCardUrl?: string;
    selfieUrl?: string;
    phoneNumber?: string;
    countryOfResidence?: string;
    city?: string;
    specializedCountries?: string;
    currentPosition?: string;
    organization?: string;
    highestEducationLevel?: string;
    universityName?: string;
    studyCountry?: string;
    languages?: string;
    fieldsOfStudy?: string;
    weeklySchedule?: string;
    sessionDuration?: number;
    profileImageUrl?: string;
    cvUrl?: string;
    certificateUrls?: string;
}

export interface UpdateCounselorDto extends Partial<CreateCounselorDto> {}

export type ConsultationMode = "chat" | "audio" | "video";

export interface WeeklySchedule {
    slots: DaySchedule[];
}

export interface DaySchedule {
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    startTime: string; // HH:mm
    endTime: string; // HH:mm
}

export interface CredentialDto {
    credentialType: string;
    fileUrl?: string;
    s3Key?: string;
}

export interface CreateSlotDto {
    startTime: Date;
    endTime: Date;
}

export interface UpdateSlotDto {
    startTime?: Date;
    endTime?: Date;
}

export interface BookingStatusDto {
    status: 'confirmed' | 'started' | 'completed' | 'cancelled' | 'disputed';
}

export interface CounselorResponse {
    id: number;
    userId: number;
    name: string;
    email: string;
    bio: string | null;
    areasOfExpertise: string | null;
    hourlyRate: number | null;
    yearsOfExperience: number | null;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    isActive: boolean;
    rating: number;
    totalSessions: number;
    qualifications: string[];
    specializations: string[];
    supportedLanguages: string[];
    consultationModes: ConsultationMode[] | null;
    currentUniversity: string | null;
    currentDegreeLevel: "bachelors" | "masters" | null;
    availabilitySummary: string | null;
    isOnboarded: boolean;
    documentUrl: string | null;
    idCardUrl: string | null;
    selfieUrl: string | null;
    phoneNumber: string | null;
    countryOfResidence: string | null;
    city: string | null;
    specializedCountries: string | null;
    currentPosition: string | null;
    organization: string | null;
    highestEducationLevel: string | null;
    universityName: string | null;
    studyCountry: string | null;
    languages: string | null;
    fieldsOfStudy: string | null;
    weeklySchedule: string | null;
    sessionDuration: number | null;
    profileImageUrl: string | null;
    cvUrl: string | null;
    certificateUrls: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface SlotResponse {
    id: number;
    counselorId: number;
    startTime: Date;
    endTime: Date;
    status: 'available' | 'booked' | 'cancelled';
    reservedStudentId: number | null;
    meetingLink: string | null;
}

export interface BookingResponse {
    id: number;
    studentId: number;
    counselorId: number;
    slotId: number;
    status: string;
    meetingLink: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
}

export interface CounselorDirectoryQuery {
    specialization?: string;
    language?: string;
    mode?: ConsultationMode;
    minRating?: number;
    fromDate?: string;
    toDate?: string;
    availableOnly?: boolean;
    page?: number;
    limit?: number;
}

export interface CounselorRecommendationResponse extends CounselorResponse {
    recommendationScore: number;
    matchReasons?: string[];
}

export interface CreateBookingDto {
    slotId: number;
    notes?: string;
}

export interface RescheduleBookingDto {
    slotId: number;
}

export interface AdminVerificationDto {
    verificationStatus: "verified" | "rejected";
}

export interface AdminVisibilityDto {
    isActive: boolean;
}

export interface DashboardOverviewResponse {
    assignedStudents: number;
    upcomingBookings: number;
    completedSessions: number;
    pendingBookings: number;
}

export interface ShareDocumentDto {
    studentId: number;
    documentType: "sop" | "cv" | "lor" | "transcript" | "other";
    fileUrl?: string;
    counselorFeedback?: string;
}

export interface SendMessageDto {
    recipientUserId: number;
    body: string;
}

export interface CounselorMessageResponse {
    id: number;
    senderUserId: number;
    recipientUserId: number;
    body: string;
    createdAt: Date;
}

export interface StudentProgressResponse {
    studentId: number;
    name: string;
    email: string;
    learningPath?: {
        id: number;
        currentProgress: number;
        targetLevel: string | null;
    } | null;
    recentAssessments?: Array<{
        id: number;
        type: string;
        score: number;
        createdAt: Date;
    }>;
    trackedScholarships?: Array<{
        id: number;
        title: string;
        matchScore: number;
        status?: string;
        deadline?: Date | null;
        completedMilestones?: number;
        totalMilestones?: number;
    }>;
}

export interface ReviewResponse {
    id: number;
    bookingId: number;
    studentId: number;
    counselorId: number;
    rating: number;
    comment: string | null;
    createdAt: Date;
    studentName?: string;
}

export interface ReviewsSummaryResponse {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
    reviews: ReviewResponse[];
}
