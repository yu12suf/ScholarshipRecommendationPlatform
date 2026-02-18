export interface CreateCounselorDto {
    bio?: string;
    areasOfExpertise?: string;
    hourlyRate?: number;
    yearsOfExperience?: number;
    credentials?: CredentialDto[];
}

export interface UpdateCounselorDto {
    bio?: string;
    areasOfExpertise?: string;
    hourlyRate?: number;
    yearsOfExperience?: number;
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

export interface StudentProgressResponse {
    studentId: number;
    name: string;
    email: string;
    learningPath?: {
        id: number;
        currentProgress: number;
        targetLevel: string;
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
