import { Op } from "sequelize";
import { Counselor } from "../models/Counselor.js";
import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { Booking } from "../models/Booking.js";
import { AvailabilitySlot } from "../models/AvailabilitySlot.js";
import { Payment } from "../models/Payment.js";
import { LearningPath } from "../models/LearningPath.js";
import { LearningPathProgress } from "../models/LearningPathProgress.js";
import { AssessmentResult } from "../models/AssessmentResult.js";
import { TrackedScholarship } from "../models/TrackedScholarship.js";
import { Scholarship } from "../models/Scholarship.js";
import { ScholarshipMilestone } from "../models/ScholarshipMilestone.js";
import { UserRole } from "../types/userTypes.js";
import { CounselorPayout } from "../models/CounselorPayout.js";
import { AvailabilitySlotRepository } from "../repositories/AvailabilitySlotRepository.js";
import { BookingRepository } from "../repositories/BookingRepository.js";
import { CounselorRepository } from "../repositories/CounselorRepository.js";
import { CounselorReviewRepository } from "../repositories/CounselorReviewRepository.js";
import { DocumentRepository } from "../repositories/DocumentRepository.js";
import { CounselorMessageRepository } from "../repositories/CounselorMessageRepository.js";
import { NotificationService } from "./NotificationService.js";
import { PaymentService } from "./PaymentService.js";
import { GoogleMeetService } from "./GoogleMeetService.js";
import { EmailService } from "./EmailService.js";
import crypto from "crypto";
import configs from "../config/configs.js";
import { FileService } from "./FileService.js";
import {
  AdminVerificationDto,
  AdminVisibilityDto,
  BookingResponse,
  BookingStatusDto,
  CounselorDirectoryQuery,
  CounselorMessageResponse,
  CounselorRecommendationResponse,
  CounselorResponse,
  CreateBookingDto,
  CreateCounselorDto,
  CreateSlotDto,
  DashboardOverviewResponse,
  RescheduleBookingDto,
  ReviewsSummaryResponse,
  SendMessageDto,
  ShareDocumentDto,
  SlotResponse,
  StudentProgressResponse,
  UpdateCounselorDto,
  UpdateSlotDto,
} from "../types/counselorTypes.js";

type CounselorMetadata = {
  qualifications?: string[];
  specializations?: string[];
  supportedLanguages?: string[];
  consultationModes?: ("chat" | "audio" | "video")[];
  currentUniversity?: string;
  currentDegreeLevel?: "bachelors" | "masters";
  availabilitySummary?: string;
};

const httpError = (statusCode: number, message: string) =>
  Object.assign(new Error(message), { statusCode });

export class CounselorService {
  static async applyAsCounselor(userId: number, dto: CreateCounselorDto, files?: any): Promise<CounselorResponse> {
    const existingCounselor = await CounselorRepository.findByUserId(userId);
    
    // If already exists and already onboarded, prevent re-application
    if (existingCounselor && existingCounselor.isOnboarded) {
      throw httpError(409, "User already has a counselor profile");
    }

    // Handle file uploads if any
    let profileImageUrl = dto.profileImageUrl;
    let cvUrl = dto.cvUrl;
    let certificateUrls = dto.certificateUrls;
    let idCardUrl = dto.idCardUrl;
    let selfieUrl = dto.selfieUrl;

    if (files) {
      if (files.profileImageUrl) profileImageUrl = await FileService.uploadFile((Array.isArray(files.profileImageUrl) ? files.profileImageUrl[0] : files.profileImageUrl).data, "counselors/profiles");
      if (files.cvUrl) cvUrl = await FileService.uploadFile((Array.isArray(files.cvUrl) ? files.cvUrl[0] : files.cvUrl).data, "counselors/cvs");
      if (files.certificateUrls) certificateUrls = await FileService.uploadFile((Array.isArray(files.certificateUrls) ? files.certificateUrls[0] : files.certificateUrls).data, "counselors/certificates");
      if (files.idCardUrl) idCardUrl = await FileService.uploadFile((Array.isArray(files.idCardUrl) ? files.idCardUrl[0] : files.idCardUrl).data, "counselors/identity/ids");
      if (files.selfieUrl) selfieUrl = await FileService.uploadFile((Array.isArray(files.selfieUrl) ? files.selfieUrl[0] : files.selfieUrl).data, "counselors/identity/selfies");
    }

    let counselor;
    if (existingCounselor) {
      // Update existing unonboarded profile
      counselor = await CounselorRepository.update(userId, {
        bio: dto.bio || existingCounselor.bio,
        areasOfExpertise: dto.areasOfExpertise ? (typeof dto.areasOfExpertise === 'string' ? dto.areasOfExpertise : JSON.stringify(dto.areasOfExpertise)) : (dto.specializations?.join(", ") || existingCounselor.areasOfExpertise),
        hourlyRate: Number(dto.hourlyRate) || existingCounselor.hourlyRate,
        yearsOfExperience: Number(dto.yearsOfExperience) || existingCounselor.yearsOfExperience,
        verificationStatus: "pending",
        isOnboarded: dto.isOnboarded || false,
        phoneNumber: dto.phoneNumber || existingCounselor.phoneNumber,
        countryOfResidence: dto.countryOfResidence || existingCounselor.countryOfResidence,
        city: dto.city || existingCounselor.city,
        specializedCountries: dto.specializedCountries ? (typeof dto.specializedCountries === 'string' ? dto.specializedCountries : JSON.stringify(dto.specializedCountries)) : existingCounselor.specializedCountries,
        currentPosition: dto.currentPosition || existingCounselor.currentPosition,
        organization: dto.organization || existingCounselor.organization,
        highestEducationLevel: dto.highestEducationLevel || existingCounselor.highestEducationLevel,
        universityName: dto.universityName || existingCounselor.universityName,
        studyCountry: dto.studyCountry || existingCounselor.studyCountry,
        languages: dto.languages ? (typeof dto.languages === 'string' ? dto.languages : JSON.stringify(dto.languages)) : existingCounselor.languages,
        fieldsOfStudy: dto.fieldsOfStudy ? (typeof dto.fieldsOfStudy === 'string' ? dto.fieldsOfStudy : JSON.stringify(dto.fieldsOfStudy)) : existingCounselor.fieldsOfStudy,
        weeklySchedule: dto.weeklySchedule || existingCounselor.weeklySchedule,
        sessionDuration: dto.sessionDuration || existingCounselor.sessionDuration,
        consultationModes: dto.consultationModes ? (typeof dto.consultationModes === 'string' ? dto.consultationModes : JSON.stringify(dto.consultationModes)) : existingCounselor.consultationModes,
        profileImageUrl: profileImageUrl || existingCounselor.profileImageUrl,
        cvUrl: cvUrl || existingCounselor.cvUrl,
        certificateUrls: certificateUrls || existingCounselor.certificateUrls,
        idCardUrl: idCardUrl || existingCounselor.idCardUrl,
        selfieUrl: selfieUrl || existingCounselor.selfieUrl,
      });
    } else {
      // Create new profile
      counselor = await CounselorRepository.create({
        userId,
      bio: dto.bio || "",
      areasOfExpertise: dto.areasOfExpertise ? (typeof dto.areasOfExpertise === 'string' ? dto.areasOfExpertise : JSON.stringify(dto.areasOfExpertise)) : (dto.specializations?.join(", ") || ""),
      hourlyRate: Number(dto.hourlyRate) || 0,
      yearsOfExperience: Number(dto.yearsOfExperience) || 0,
      verificationStatus: "pending",
      isActive: true,
      isOnboarded: dto.isOnboarded || false,
      idCardUrl: idCardUrl || null,
      selfieUrl: selfieUrl || null,
      phoneNumber: dto.phoneNumber || null,
      countryOfResidence: dto.countryOfResidence || null,
      city: dto.city || null,
      specializedCountries: dto.specializedCountries ? (typeof dto.specializedCountries === 'string' ? dto.specializedCountries : JSON.stringify(dto.specializedCountries)) : null,
      currentPosition: dto.currentPosition || null,
      organization: dto.organization || null,
      highestEducationLevel: dto.highestEducationLevel || null,
      universityName: dto.universityName || null,
      studyCountry: dto.studyCountry || null,
      languages: dto.languages ? (typeof dto.languages === 'string' ? dto.languages : JSON.stringify(dto.languages)) : null,
      fieldsOfStudy: dto.fieldsOfStudy ? (typeof dto.fieldsOfStudy === 'string' ? dto.fieldsOfStudy : JSON.stringify(dto.fieldsOfStudy)) : null,
      weeklySchedule: dto.weeklySchedule || null,
      sessionDuration: dto.sessionDuration || 60,
      consultationModes: dto.consultationModes ? (typeof dto.consultationModes === 'string' ? dto.consultationModes : JSON.stringify(dto.consultationModes)) : null,
      profileImageUrl: profileImageUrl || null,
      cvUrl: cvUrl || null,
      certificateUrls: certificateUrls || null,
      extractedData: JSON.stringify(this.mergeMetadata(null, dto)),
      });
    }

    if (!counselor) {
      throw httpError(500, "Failed to create or update counselor profile");
    }

    const user = await User.findByPk(userId);
    return this.formatCounselorResponse(counselor, user);
  }

  static async getMyProfile(userId: number): Promise<CounselorResponse> {
    const user = await User.findByPk(userId);
    if (!user) throw httpError(404, "User not found");

    const counselor = await CounselorRepository.findByUserId(userId);
    if (!counselor) {
      // Return a partial profile for a counselor who hasn't applied yet
      return {
        id: 0,
        userId: user.id,
        name: user.name,
        email: user.email,
        bio: "",
        areasOfExpertise: "",
        hourlyRate: 0,
        yearsOfExperience: 0,
        verificationStatus: "pending",
        isActive: true,
        rating: 0,
        totalSessions: 0,
        qualifications: [],
        specializations: [],
        supportedLanguages: [],
        currentUniversity: null,
        currentDegreeLevel: null,
        availabilitySummary: null,
        isOnboarded: false,
        documentUrl: null,
        idCardUrl: null,
        selfieUrl: null,
        phoneNumber: null,
        countryOfResidence: null,
        city: null,
        specializedCountries: null,
        currentPosition: null,
        organization: null,
        highestEducationLevel: null,
        universityName: null,
        studyCountry: null,
        languages: null,
        fieldsOfStudy: null,
        weeklySchedule: null,
        sessionDuration: 60,
        consultationModes: null,
        profileImageUrl: null,
        cvUrl: null,
        certificateUrls: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return this.formatCounselorResponse(counselor, user);
  }

  static async getPublicDirectory(query: CounselorDirectoryQuery): Promise<{
    rows: CounselorResponse[];
    count: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const { rows, count } = await CounselorRepository.findVerifiedDirectory({
      ...(query.specialization ? { specialization: query.specialization } : {}),
      ...(query.language ? { language: query.language } : {}),
      ...(query.mode ? { mode: query.mode } : {}),
      ...(query.minRating !== undefined ? { minRating: query.minRating } : {}),
      page,
      limit,
    });

    const filteredRows = rows.filter((counselor) => {
      const metadata = this.parseMetadata(counselor.extractedData);
      if (query.language && !metadata.supportedLanguages?.some((x) => x.toLowerCase() === query.language?.toLowerCase())) {
        return false;
      }
      if (query.mode && !metadata.consultationModes?.includes(query.mode)) {
        return false;
      }
      return true;
    });

    const slotsByCounselor = await this.findAvailableSlotsForDirectory(
      filteredRows.map((item) => item.id),
      query.fromDate,
      query.toDate,
    );

    const availabilityFilteredRows =
      query.availableOnly
        ? filteredRows.filter((item) => (slotsByCounselor.get(item.id) || []).length > 0)
        : filteredRows;

    const payload = availabilityFilteredRows.map((c) => {
      const base = this.formatCounselorResponse(c, (c as any).user || null);
      const availableSlots = slotsByCounselor.get(c.id) || [];
      return {
        ...base,
        availabilitySummary:
          base.availabilitySummary ||
          (availableSlots.length > 0 ? `${availableSlots.length} open slots` : null),
      };
    });

    return {
      rows: payload,
      count: query.availableOnly ? payload.length : count,
      page,
      limit,
    };
  }

  static async recommendForStudent(userId: number): Promise<CounselorRecommendationResponse[]> {
    const student = await Student.findOne({ where: { userId } });
    if (!student) throw httpError(404, "Student profile not found");

    const studentProfileSignal = [
      typeof student.studyPreferences === 'object' ? JSON.stringify(student.studyPreferences) : student.studyPreferences,
      typeof student.academicHistory === 'object' ? JSON.stringify(student.academicHistory) : student.academicHistory,
      student.countryInterest,
      student.academicStatus,
      student.fieldOfStudy,
      student.researchArea,
      typeof student.extractedData === 'object' ? JSON.stringify(student.extractedData) : student.extractedData,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const candidates = await Counselor.findAll({
      where: { verificationStatus: "verified", isActive: true },
      include: [{ model: User, as: "user", attributes: ["name", "email"] }],
      order: [["rating", "DESC"]],
    });

    return candidates
      .map((counselor) => {
        const metadata = this.parseMetadata(counselor.extractedData);
        const matchReasons: string[] = [];
        let recommendationScore = Number(counselor.rating || 0);

        const expertiseText = (counselor.areasOfExpertise || "").toLowerCase();
        if (expertiseText && this.hasTokenOverlap(expertiseText, studentProfileSignal)) {
          recommendationScore += 2;
          matchReasons.push("Expertise aligns with your academic focus");
        }

        // Check target study countries
        const counselorCountries = [
            counselor.studyCountry, 
            counselor.specializedCountries, 
            counselor.countryOfResidence
        ].join(" ").toLowerCase();
        
        const studentCountries = (student.countryInterest || "").toLowerCase();
        
        if (studentCountries && counselorCountries && this.hasTokenOverlap(counselorCountries, studentCountries)) {
            recommendationScore += 5;
            matchReasons.push(`Direct experience in your target country`);
        }

        // Check target universe/institution
        const uniName = (counselor.universityName || metadata.currentUniversity || "").toLowerCase();
        if (uniName && uniName.length > 3 && studentProfileSignal.includes(uniName)) {
          recommendationScore += 4;
          matchReasons.push("Attended your prospective university");
        }

        // Check degree level alignment
        const degLevel = (counselor.highestEducationLevel || metadata.currentDegreeLevel || "").toLowerCase();
        if (degLevel && studentProfileSignal.includes(degLevel)) {
          recommendationScore += 1;
          matchReasons.push("Education level alignment");
        }

        const base = this.formatCounselorResponse(counselor, (counselor as any).user || null);
        return { ...base, recommendationScore, matchReasons };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10);
  }

  static async getReviews(counselorId: number): Promise<ReviewsSummaryResponse> {
    const reviews = await CounselorReviewRepository.findAllByCounselor(counselorId);
    const stats = await CounselorReviewRepository.getStatistics(counselorId);
    return {
      totalReviews: stats.totalReviews,
      averageRating: stats.averageRating,
      ratingDistribution: stats.ratingDistribution,
      reviews: reviews.map((review) => ({
        id: review.id,
        bookingId: review.bookingId,
        studentId: review.studentId,
        counselorId: review.counselorId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        studentName: (review as any).student?.user?.name || "Anonymous",
      })),
    };
  }

  static async updateProfile(userId: number, dto: UpdateCounselorDto, files?: any): Promise<CounselorResponse> {
    const counselor = await CounselorRepository.findByUserId(userId);
    if (!counselor) throw httpError(404, "Counselor profile not found");

    // Handle file uploads if any
    let profileImageUrl = dto.profileImageUrl;
    let cvUrl = dto.cvUrl;
    let certificateUrls = dto.certificateUrls;
    let idCardUrl = dto.idCardUrl;
    let selfieUrl = dto.selfieUrl;

    if (files) {
      if (files.profileImageUrl) profileImageUrl = await FileService.uploadFile((Array.isArray(files.profileImageUrl) ? files.profileImageUrl[0] : files.profileImageUrl).data, "counselors/profiles");
      if (files.cvUrl) cvUrl = await FileService.uploadFile((Array.isArray(files.cvUrl) ? files.cvUrl[0] : files.cvUrl).data, "counselors/cvs");
      if (files.certificateUrls) certificateUrls = await FileService.uploadFile((Array.isArray(files.certificateUrls) ? files.certificateUrls[0] : files.certificateUrls).data, "counselors/certificates");
      if (files.idCardUrl) idCardUrl = await FileService.uploadFile((Array.isArray(files.idCardUrl) ? files.idCardUrl[0] : files.idCardUrl).data, "counselors/identity/ids");
      if (files.selfieUrl) selfieUrl = await FileService.uploadFile((Array.isArray(files.selfieUrl) ? files.selfieUrl[0] : files.selfieUrl).data, "counselors/identity/selfies");
    }

    await counselor.update({
      bio: dto.bio ?? counselor.bio,
      areasOfExpertise: dto.areasOfExpertise ? (typeof dto.areasOfExpertise === 'string' ? dto.areasOfExpertise : JSON.stringify(dto.areasOfExpertise)) : (dto.specializations?.join(", ") ?? counselor.areasOfExpertise),
      hourlyRate: dto.hourlyRate !== undefined ? (Number(dto.hourlyRate) || 0) : counselor.hourlyRate,
      yearsOfExperience: dto.yearsOfExperience !== undefined ? (Number(dto.yearsOfExperience) || 0) : counselor.yearsOfExperience,
      extractedData: JSON.stringify(this.mergeMetadata(counselor.extractedData, dto)),
      isOnboarded: dto.isOnboarded ?? counselor.isOnboarded,
      documentUrl: dto.documentUrl ?? counselor.documentUrl,
      idCardUrl: idCardUrl ?? counselor.idCardUrl,
      selfieUrl: selfieUrl ?? counselor.selfieUrl,
      phoneNumber: dto.phoneNumber ?? counselor.phoneNumber,
      countryOfResidence: dto.countryOfResidence ?? counselor.countryOfResidence,
      city: dto.city ?? counselor.city,
      specializedCountries: dto.specializedCountries ? (typeof dto.specializedCountries === 'string' ? dto.specializedCountries : JSON.stringify(dto.specializedCountries)) : counselor.specializedCountries,
      currentPosition: dto.currentPosition ?? counselor.currentPosition,
      organization: dto.organization ?? counselor.organization,
      highestEducationLevel: dto.highestEducationLevel ?? counselor.highestEducationLevel,
      universityName: dto.universityName ?? counselor.universityName,
      studyCountry: dto.studyCountry ?? counselor.studyCountry,
      languages: dto.languages ? (typeof dto.languages === 'string' ? dto.languages : JSON.stringify(dto.languages)) : counselor.languages,
      fieldsOfStudy: dto.fieldsOfStudy ? (typeof dto.fieldsOfStudy === 'string' ? dto.fieldsOfStudy : JSON.stringify(dto.fieldsOfStudy)) : counselor.fieldsOfStudy,
      weeklySchedule: dto.weeklySchedule ?? counselor.weeklySchedule,
      sessionDuration: dto.sessionDuration ?? counselor.sessionDuration,
      consultationModes: dto.consultationModes ? (typeof dto.consultationModes === 'string' ? dto.consultationModes : JSON.stringify(dto.consultationModes)) : counselor.consultationModes,
      profileImageUrl: profileImageUrl ?? counselor.profileImageUrl,
      cvUrl: cvUrl ?? counselor.cvUrl,
      certificateUrls: certificateUrls ?? counselor.certificateUrls,
    });

    const user = await User.findByPk(userId);
    return this.formatCounselorResponse(counselor, user);
  }

  static async deleteProfile(userId: number): Promise<void> {
    const counselor = await CounselorRepository.findByUserId(userId);
    if (!counselor) throw httpError(404, "Counselor profile not found");
    await counselor.update({ isActive: false });
  }

  static async createSlots(counselorId: number, slots: CreateSlotDto[]): Promise<SlotResponse[]> {
    if (slots.length === 0) throw httpError(400, "Slots array is required");

    // 1. Update Counselor profile with the new weekly schedule
    const counselor = await CounselorRepository.findById(counselorId);
    if (!counselor) throw httpError(404, "Counselor not found");
    
    await counselor.update({ weeklySchedule: JSON.stringify(slots) });

    // 2. Generate individual slot records for the next 4 weeks
    const dayMap: Record<string, number> = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };

    const slotsToCreate: any[] = [];
    const now = new Date();

    for (let week = 0; week < 4; week++) {
      for (const slot of slots) {
        const targetDay = dayMap[slot.dayOfWeek];
        if (targetDay === undefined) continue;

        const [startH, startM] = slot.startTime.split(':').map(Number);
        const [endH, endM] = slot.endTime.split(':').map(Number);

        const date = new Date(now);
        // Find the next occurrence of this day of the week
        const currentDay = now.getDay();
        let diff = targetDay - currentDay;
        if (diff < 0) diff += 7; // Ensure we move forward
        
        date.setDate(now.getDate() + diff + (week * 7));
        
        const startTime = new Date(date);
        startTime.setHours(startH as number, startM, 0, 0);
        
        const endTime = new Date(date);
        endTime.setHours(endH as number , endM, 0, 0);

        // Skip if this time has already passed
        if (startTime < now) continue;

        // Check for overlaps with booked slots (which we didn't delete)
        const overlap = await AvailabilitySlotRepository.findOverlappingSlots(counselorId, startTime, endTime);
        if (overlap) continue;

        slotsToCreate.push({
          counselorId,
          startTime,
          endTime,
          status: 'available'
        });
      }
    }

    if (slotsToCreate.length === 0) {
      // Refresh and return existing slots if no new ones were created
      const existing = await AvailabilitySlotRepository.findAllByCounselor(counselorId, { fromDate: now });
      return existing.map(s => this.formatSlotResponse(s));
    }

    const created = await AvailabilitySlotRepository.bulkCreate(slotsToCreate);
    return created.map((slot) => this.formatSlotResponse(slot));
  }

  static async getSlots(counselorId: number, fromDate?: string, toDate?: string, status?: string): Promise<SlotResponse[]> {
    const filters = {
      ...(fromDate ? { fromDate: new Date(fromDate) } : {}),
      ...(toDate ? { toDate: new Date(toDate) } : {}),
      ...(status ? { status } : {}),
    };
    const slots = await AvailabilitySlotRepository.findAllByCounselor(counselorId, filters);
    return slots.map((slot) => this.formatSlotResponse(slot));
  }

  static async getAvailableSessions(counselorId: number): Promise<SlotResponse[]> {
    const filters = {
      fromDate: new Date(), // Only future slots
      status: 'available',   // Only available slots
    };
    const slots = await AvailabilitySlotRepository.findAllByCounselor(counselorId, filters);
    return slots.map((slot) => this.formatSlotResponse(slot));
  }

  static async updateSlot(counselorId: number, slotId: number, dto: UpdateSlotDto): Promise<SlotResponse> {
    const slot = await AvailabilitySlotRepository.findByIdAndCounselorId(slotId, counselorId);
    if (!slot) throw httpError(404, "Slot not found");
    if (slot.status === "booked") throw httpError(409, "Cannot modify a booked slot");

    const startTime = dto.startTime ? new Date(dto.startTime) : slot.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : slot.endTime;
    if (endTime <= startTime) throw httpError(400, "End time must be after start time");
    const overlap = await AvailabilitySlotRepository.findOverlappingSlots(counselorId, startTime, endTime, slotId);
    if (overlap) throw httpError(409, "Updated slot would overlap with existing slot");

    const updated = await AvailabilitySlotRepository.update(slotId, { startTime, endTime });
    if (!updated) throw httpError(404, "Slot not found");
    return this.formatSlotResponse(updated);
  }

  static async deleteSlot(counselorId: number, slotId: number): Promise<void> {
    const slot = await AvailabilitySlotRepository.findByIdAndCounselorId(slotId, counselorId);
    if (!slot) throw httpError(404, "Slot not found");
    if (slot.status === "booked") throw httpError(409, "Cannot delete a booked slot");
    await AvailabilitySlotRepository.softDelete(slotId);
  }

  static async createBooking(userId: number, dto: CreateBookingDto): Promise<any> {
    const student = await Student.findOne({ where: { userId } });
    if (!student) throw httpError(404, "Student profile not found");
    const user = await User.findByPk(userId);
    const slot = await AvailabilitySlotRepository.findById(dto.slotId);
    if (!slot || slot.status !== "available") throw httpError(409, "Slot is not available");
    const counselor = await CounselorRepository.findById(slot.counselorId);
    if (!counselor || counselor.verificationStatus !== "verified" || !counselor.isActive) {
      throw httpError(403, "Counselor is not available for booking");
    }

    const amount = Number(counselor.hourlyRate) || 500; // default 500 ETB if not set
    const currency = 'ETB';
    const tx_ref = `booking-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const booking = await BookingRepository.create({
      studentId: student.id,
      counselorId: slot.counselorId,
      slotId: slot.id,
      status: 'pending',
    });

    const payment = await Payment.create({
      studentId: student.id,
      bookingId: booking.id,
      amount,
      currency,
      tx_ref,
      status: 'pending'
    });

    await booking.update({ paymentId: payment.id });

    // Assuming we want to redirect user back to a specific route
    const returnUrl = `${configs.FRONTEND_URL}/dashboard/student/bookings/success?bookingId=${booking.id}&tx_ref=${tx_ref}`;

    const chapaResponse = await PaymentService.initializePayment(
      tx_ref,
      amount,
      currency,
      user?.email || 'student@edu-pathway.com',
      user?.name?.split(' ')[0] || 'Student',
      user?.name?.split(' ')[1] || 'User',
      returnUrl
    );

    await AvailabilitySlotRepository.update(slot.id, {
      status: "booked", // postgres strictly checks for 'available', 'booked', 'cancelled'
      reservedStudentId: student.id,
    });

    // Notify counselor about new request
    try {
      await NotificationService.createNotification(
        counselor.userId,
        "New Booking Request",
        `A student (${user?.name || 'Student'}) has requested a session for ${slot.startTime.toLocaleString()}`,
        "booking",
        booking.id
      );
    } catch (notifyError) {
      console.error("[CounselorService] Failed to send initial booking notification:", notifyError);
    }

    return {
      booking: this.formatBookingResponse(booking),
      checkoutUrl: chapaResponse.data.checkout_url
    };
  }

  static async initiateBookingByCounselor(counselorUserId: number, studentUserId: number, slotId: number): Promise<any> {
    const counselor = await CounselorRepository.findByUserId(counselorUserId);
    if (!counselor || counselor.verificationStatus !== "verified" || !counselor.isActive) {
      throw httpError(403, "Counselor profile not active or verified");
    }

    const student = await Student.findOne({ where: { userId: studentUserId } });
    if (!student) throw httpError(404, "Student profile not found");

    const slot = await AvailabilitySlotRepository.findByIdAndCounselorId(slotId, counselor.id);
    if (!slot || slot.status !== "available") throw httpError(409, "Slot is not available");

    // Create a pending booking
    const booking = await BookingRepository.create({
      studentId: student.id,
      counselorId: counselor.id,
      slotId: slot.id,
      status: 'pending',
    });

    return { booking, message: "Session invitation sent to student. They need to pay to confirm." };
  }

  static async confirmBooking(tx_ref: string): Promise<{ success: boolean; status: string; message: string; booking?: any }> {
    const payment = await Payment.findOne({ where: { tx_ref } });
    
    if (!payment) {
      console.error(`[ConfirmBooking] Payment record not found for tx_ref: ${tx_ref}`);
      return { success: false, status: 'not_found', message: "Payment record not found." };
    }

    if (payment.status === 'success') {
      const booking = await Booking.findByPk(payment.bookingId || 0);
      return { success: true, status: 'success', message: "Payment already verified.", booking };
    }

    try {
      console.log(`[ConfirmBooking] Verifying with Chapa for tx_ref: ${tx_ref}`);
      const chapaVerify = await PaymentService.verifyPayment(tx_ref);
      
      // Chapa's response structure: { status: "success", message: "...", data: { status: "success", ... } }
      const apiSuccess = chapaVerify.status === 'success';
      const transactionStatus = chapaVerify.data?.status;

      console.log(`[ConfirmBooking] Chapa response for ${tx_ref}: API Status: ${chapaVerify.status}, Transaction Status: ${transactionStatus}`);
      
      if (apiSuccess && transactionStatus === 'success') {
        await payment.update({ status: 'success' });
        
        const booking = await Booking.findByPk(payment.bookingId || 0);
        if (booking) {
          if (booking.status === 'pending') {
            const slot = await AvailabilitySlot.findByPk(booking.slotId);
            
            // Fetch user emails for student and counselor so calendar invites/emails are sent to both.
            const attendees: Array<{ email: string; name?: string }> = [];
            let studentEmail: string | null = null;
            let studentName: string | null = null;
            let counselorEmail: string | null = null;
            let counselorName: string | null = null;
            try {
              const [student, counselor] = await Promise.all([
                Student.findByPk(booking.studentId, { include: [{ model: User, as: 'user' }] }),
                Counselor.findByPk(booking.counselorId, { include: [{ model: User, as: 'user' }] })
              ]);

              const studentUser =
                (typeof (student as any)?.get === "function" ? (student as any).get("user") : null) ||
                (student as any)?.user ||
                (student as any)?.dataValues?.user ||
                (student as any)?.User;
              const counselorUser =
                (typeof (counselor as any)?.get === "function" ? (counselor as any).get("user") : null) ||
                (counselor as any)?.user ||
                (counselor as any)?.dataValues?.user ||
                (counselor as any)?.User;

              if (studentUser?.email) {
                studentEmail = studentUser.email;
                studentName = studentUser.name || null;
                attendees.push({ email: studentUser.email, name: studentUser.name });
              }

              if (counselorUser?.email) {
                counselorEmail = counselorUser.email;
                counselorName = counselorUser.name || null;
                attendees.push({ email: counselorUser.email, name: counselorUser.name });
              }

              console.log(`[ConfirmBooking] Attendees for meeting: ${attendees.map((a) => a.email).join(', ')}`);
            } catch (e) {
              console.error("[ConfirmBooking] Error fetching attendee emails:", e);
            }

            // Generate Google Meet Link
            let meetingLink = `https://meet.edu-pathway.com/session-${booking.id}`;
            try {
              if (slot) {
                console.log(`[ConfirmBooking] Creating Google Meet for booking ${booking.id}`);
                meetingLink = await GoogleMeetService.createMeeting(
                  "Counseling Session: Educational Pathway",
                  `Counseling session between student and counselor.`,
                  slot.startTime,
                  60,
                  attendees
                );
              }
            } catch (e) {
              console.error("[ConfirmBooking] Google Meet creation failed, using fallback:", e);
            }

            await booking.update({ status: 'confirmed', meetingLink });
            if (slot) {
              await slot.update({ status: 'booked' }); // slot has no meetingLink column

              // Send direct email invites to both participants as a reliable fallback.
              try {
                const endTime = new Date(slot.startTime.getTime() + 60 * 60 * 1000);
                const sendEmailTasks: Promise<void>[] = [];

                if (studentEmail) {
                  sendEmailTasks.push(
                    EmailService.sendSessionInviteEmail({
                      to: studentEmail,
                      recipientName: studentName || "Student",
                      counterpartName: counselorName || "Counselor",
                      meetingLink,
                      startTime: slot.startTime,
                      endTime,
                    })
                  );
                }

                if (counselorEmail) {
                  sendEmailTasks.push(
                    EmailService.sendSessionInviteEmail({
                      to: counselorEmail,
                      recipientName: counselorName || "Counselor",
                      counterpartName: studentName || "Student",
                      meetingLink,
                      startTime: slot.startTime,
                      endTime,
                    })
                  );
                }

                await Promise.all(sendEmailTasks);
                console.log(`[ConfirmBooking] Direct invite emails sent to: ${[studentEmail, counselorEmail].filter(Boolean).join(', ')}`);
              } catch (emailError) {
                console.error("[ConfirmBooking] Failed to send direct invite emails:", emailError);
              }
              
              // Update counselor balance
              const counselor = await CounselorRepository.findById(booking.counselorId);
              if (counselor) {
                const amount = Number(payment.amount);
                await counselor.increment({
                  totalEarned: amount,
                  pendingBalance: amount
                });

                // Notify counselor about confirmed booking
                try {
                  await NotificationService.createNotification(
                    counselor.userId,
                    "Booking Confirmed",
                    `Payment received! Your session for ${slot.startTime.toLocaleString()} is confirmed.`,
                    "booking",
                    booking.id
                  );
                } catch (notifyError) {
                  console.error("[CounselorService] Failed to send confirmation notification:", notifyError);
                }
                console.log(`[ConfirmBooking] Updated counselor ${counselor.id} balance by ${amount}`);
              }

              this.queueSessionReminder(booking.id, slot.startTime);
            }
            return { success: true, status: 'success', message: "Payment verified and session confirmed.", booking };
          }
          return { success: true, status: 'success', message: "Payment verified, but booking was already processed.", booking };
        }
        
        return { success: true, status: 'success', message: "Payment verified, but booking record not found." };
      } else if (apiSuccess && transactionStatus === 'pending') {
        return { success: false, status: 'pending', message: "Payment is still pending. Please wait or refresh." };
      } else {
        // Only mark as failed if explicitly failed by Chapa
        if (transactionStatus === 'failed') {
          await payment.update({ status: 'failed' });
          const booking = await Booking.findByPk(payment.bookingId || 0);
          if (booking) {
            await booking.update({ status: 'cancelled' });
            await AvailabilitySlot.update({ status: 'available', reservedStudentId: null }, { where: { id: booking.slotId } });
          }
          return { success: false, status: 'failed', message: "Payment was declined by Chapa." };
        }
        
        return { success: false, status: 'unknown', message: `Payment verification incomplete. Status: ${transactionStatus || 'unknown'}` };
      }
    } catch (error: any) {
      console.error("[ConfirmBooking] Error:", error.message);
      // Don't mark as failed on network/API errors, just return failure to the user so they can retry
      return { success: false, status: 'error', message: "Could not reach Chapa for verification. Please try again in a moment." };
    }
  }

  static async rescheduleBooking(userId: number, bookingId: number, dto: RescheduleBookingDto): Promise<BookingResponse> {
    const student = await Student.findOne({ where: { userId } });
    if (!student) throw httpError(404, "Student profile not found");
    const booking = await BookingRepository.findById(bookingId);
    if (!booking || booking.studentId !== student.id) throw httpError(404, "Booking not found");
    if (booking.status === "completed" || booking.status === "cancelled") throw httpError(409, "Cannot reschedule this booking");

    const newSlot = await AvailabilitySlotRepository.findById(dto.slotId);
    if (!newSlot || newSlot.status !== "available") throw httpError(409, "Requested slot is not available");
    if (newSlot.counselorId !== booking.counselorId) throw httpError(400, "Reschedule must remain with the same counselor");

    await AvailabilitySlotRepository.update(booking.slotId, { status: "available", reservedStudentId: null, meetingLink: null });
    await AvailabilitySlotRepository.update(newSlot.id, {
      status: "booked",
      reservedStudentId: student.id,
      meetingLink: newSlot.meetingLink || booking.meetingLink,
    });

    const updated = await booking.update({
      slotId: newSlot.id,
      status: "confirmed",
      meetingLink: newSlot.meetingLink || booking.meetingLink,
    });
    this.queueSessionReminder(updated.id, newSlot.startTime);
    return this.formatBookingResponse(updated);
  }

  static async cancelBooking(userId: number, role: UserRole, bookingId: number): Promise<BookingResponse> {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) throw httpError(404, "Booking not found");
    const student = await Student.findOne({ where: { userId } });
    const counselor = await CounselorRepository.findByUserId(userId);

    const authorized =
      role === UserRole.ADMIN ||
      (role === UserRole.STUDENT && !!student && booking.studentId === student.id) ||
      (role === UserRole.COUNSELOR && !!counselor && booking.counselorId === counselor.id);

    if (!authorized) throw httpError(403, "Unauthorized to cancel this booking");
    if (booking.status === "completed") throw httpError(409, "Cannot cancel a completed booking");

    await booking.update({ status: "cancelled" });
    await AvailabilitySlotRepository.update(booking.slotId, { status: "available", reservedStudentId: null, meetingLink: null });
    return this.formatBookingResponse(booking);
  }

  static async getStudents(counselorId: number): Promise<any[]> {
    const bookings = await BookingRepository.findUniqueStudentsByCounselor(counselorId);
    const uniqueStudents = new Map<number, any>();
    bookings.forEach((booking) => {
      const student =
        (typeof (booking as any)?.get === "function" ? (booking as any).get("student") : null) ||
        (booking as any)?.student ||
        (booking as any)?.dataValues?.student ||
        null;

      if (!student) return;

      const studentUser =
        (typeof student?.get === "function" ? student.get("user") : null) ||
        student?.user ||
        student?.dataValues?.user ||
        null;

      if (!uniqueStudents.has(student.id)) {
        uniqueStudents.set(student.id, {
          studentId: student.id,
          userId: student.userId,
          name: studentUser?.name || "Unknown",
          email: studentUser?.email || "Unknown",
          lastBookingDate: booking.createdAt,
          lastBookingStatus: booking.status,
        });
      }
    });
    return Array.from(uniqueStudents.values());
  }

  static async getStudentProgress(counselorId: number, studentId: number): Promise<StudentProgressResponse> {
    const link = await Booking.findOne({ where: { counselorId, studentId } });
    if (!link) throw httpError(403, "You are not authorized to view this student's progress");
    const student = await Student.findByPk(studentId, { include: [{ model: User, as: "user", attributes: ["name", "email"] }] });
    if (!student) throw httpError(404, "Student not found");
    const [learningPath, learningPathProgressRows, recentAssessments, trackedScholarships] = await Promise.all([
      LearningPath.findOne({ where: { studentId } }),
      LearningPathProgress.findAll({ where: { studentId } }),
      AssessmentResult.findAll({
        where: { studentId },
        order: [["createdAt", "DESC"]],
        limit: 5,
      }),
      TrackedScholarship.findAll({
        where: { studentId },
        include: [
          { model: Scholarship },
          { model: ScholarshipMilestone },
        ],
        order: [["updatedAt", "DESC"]],
        limit: 10,
      }),
    ]);

    const completedProgressCount = learningPathProgressRows.filter((item) => item.isCompleted).length;
    const progressPercent =
      learningPathProgressRows.length > 0
        ? Math.round((completedProgressCount / learningPathProgressRows.length) * 100)
        : 0;

    return {
      studentId: student.id,
      name: (student as any).user?.name || "Unknown",
      email: (student as any).user?.email || "Unknown",
      learningPath: learningPath
        ? {
            id: learningPath.id,
            currentProgress: progressPercent,
            targetLevel: null,
          }
        : null,
      recentAssessments: recentAssessments.map((assessment) => ({
        id: assessment.id,
        type: assessment.examType,
        score: Number(assessment.overallBand || 0),
        createdAt: assessment.createdAt,
      })),
      trackedScholarships: trackedScholarships.map((item: any) => {
        const milestones = item.scholarshipMilestones || [];
        const completedMilestones = milestones.filter((milestone: any) => milestone.isCompleted).length;
        return {
          id: item.id,
          title: item.scholarship?.title || "Untitled Scholarship",
          matchScore: 0,
          status: item.status,
          deadline: item.manualDeadline || item.scholarship?.deadline || null,
          completedMilestones,
          totalMilestones: milestones.length,
        };
      }),
    };
  }

  static async getDashboardOverview(counselorId: number): Promise<DashboardOverviewResponse> {
    const bookings = await BookingRepository.findAllByCounselor(counselorId);
    const assignedStudents = new Set(bookings.map((b) => b.studentId)).size;
    return {
      assignedStudents,
      upcomingBookings: bookings.filter((b) => b.status === "confirmed" || b.status === "started").length,
      completedSessions: bookings.filter((b) => b.status === "completed").length,
      pendingBookings: bookings.filter((b) => b.status === "pending").length,
    };
  }

  static async getDashboardDocuments(counselorId: number) {
    return DocumentRepository.findAllByCounselor(counselorId);
  }

  static async shareDocument(counselorId: number, dto: ShareDocumentDto) {
    const bookingLink = await Booking.findOne({ where: { counselorId, studentId: dto.studentId } });
    if (!bookingLink) throw httpError(403, "You can share documents only with assigned students");
    const payload = {
      studentId: dto.studentId,
      counselorId,
      documentType: dto.documentType,
      ...(dto.fileUrl ? { fileUrl: dto.fileUrl } : {}),
      ...(dto.counselorFeedback ? { counselorFeedback: dto.counselorFeedback } : {}),
    };
    return DocumentRepository.create(payload);
  }

  static async getUpcomingBookings(counselorId: number): Promise<BookingResponse[]> {
    const now = new Date();
    console.log(`[GetUpcomingBookings] Fetching upcoming bookings for counselor ${counselorId} at ${now.toISOString()}`);
    console.log("Upcoming bookings for counselor", now.toISOString());
    const bookings = await BookingRepository.findUpcomingByCounselor(counselorId, true);
    return bookings.map((booking) => this.formatBookingResponse(booking));
  }

  static async updateBookingStatus(counselorId: number, bookingId: number, dto: BookingStatusDto): Promise<BookingResponse> {
    const booking = await BookingRepository.findByIdWithAssociations(bookingId);
    if (!booking || booking.counselorId !== counselorId) throw httpError(404, "Booking not found");
    if (dto.status === "started" && booking.status !== "confirmed") throw httpError(409, "Can only start a confirmed booking");
    if (dto.status === "completed" && booking.status !== "started") throw httpError(409, "Can only complete a started booking");
    if (dto.status === "cancelled" && booking.status === "completed") throw httpError(409, "Cannot cancel a completed booking");

    if (dto.status === "started") await booking.update({ status: "started", startedAt: new Date() });
    if (dto.status === "completed") {
      await booking.update({ status: "completed", completedAt: new Date() });
      const counselor = await Counselor.findByPk(counselorId);
      if (counselor) {
        const sessionPrice = Number(counselor.hourlyRate || 500);
        // Deduct 10% platform fee
        const counselorCut = sessionPrice * 0.9;
        await counselor.update({ 
          totalSessions: (counselor.totalSessions || 0) + 1,
          pendingBalance: (Number(counselor.pendingBalance) || 0) + counselorCut
        });
      }
      await AvailabilitySlotRepository.update(booking.slotId, { status: "available", reservedStudentId: null, meetingLink: null });
    }
    if (dto.status === "cancelled") {
      await booking.update({ status: "cancelled" });
      await AvailabilitySlotRepository.update(booking.slotId, { status: "available", reservedStudentId: null, meetingLink: null });
    }
    if (dto.status === "disputed") {
      await booking.update({ status: "disputed" });
    }
    return this.formatBookingResponse(booking);
  }

  static async joinSession(userId: number, role: UserRole, bookingId: number): Promise<{ meetingLink: string }> {
    const booking = await BookingRepository.findByIdWithAssociations(bookingId);
    if (!booking) throw httpError(404, "Booking not found");
    const counselor = await CounselorRepository.findByUserId(userId);
    const student = await Student.findOne({ where: { userId } });
    const isCounselorOwner = role === UserRole.COUNSELOR && counselor?.id === booking.counselorId;
    const isStudentOwner = role === UserRole.STUDENT && student?.id === booking.studentId;
    if (!(isCounselorOwner || isStudentOwner || role === UserRole.ADMIN)) throw httpError(403, "Unauthorized to join this session");
    if (!["confirmed", "started"].includes(booking.status)) throw httpError(409, "Cannot join a session that is not confirmed or started");

    const now = new Date();
    const slot =
      (typeof (booking as any)?.get === "function" ? (booking as any).get("slot") : null) ||
      (booking as any)?.slot ||
      (booking as any)?.dataValues?.slot ||
      null;
    if (!slot) throw httpError(404, "Slot not found");
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    if (now > end) throw httpError(409, "This session has already ended");

    const meetingLink = booking.meetingLink || slot.meetingLink || `https://meet.edu-pathway.com/session-${booking.id}`;
    // Allow immediate access once the meeting exists; only mark started near/after scheduled start.
    const shouldAutoStart = now.getTime() >= start.getTime() - 10 * 60 * 1000;
    if (booking.status === "confirmed" && shouldAutoStart) {
      await booking.update({ status: "started", startedAt: now, meetingLink });
    }
    return { meetingLink };
  }

  static async updateVerification(counselorId: number, dto: AdminVerificationDto): Promise<CounselorResponse> {
    const counselor = await CounselorRepository.findById(counselorId);
    if (!counselor) throw httpError(404, "Counselor not found");
    await counselor.update({ verificationStatus: dto.verificationStatus });
    const user = await User.findByPk(counselor.userId);
    return this.formatCounselorResponse(counselor, user);
  }

  static async adminList(): Promise<CounselorResponse[]> {
    const counselors = await Counselor.findAll({
      include: [{ 
        model: User, 
        as: "user", 
        attributes: ["id", "name", "email"] 
      }],
    });

    return await Promise.all(counselors.map(async (c) => {
      const plain = c.get({ plain: true });
      let u = plain.user || plain.User || (c as any).user || (c as any).User || null;
      
      // ABSOLUTE FALLBACK: If join failed for some reason, look up manually
      if (!u) {
        console.warn(`[adminList] Join failure for Counselor ${c.id}, attempting direct lookup for User ${c.userId}`);
        u = await User.findByPk(c.userId, { attributes: ["id", "name", "email"] });
      }
      
      return this.formatCounselorResponse(c, u);
    }));
  }

  static async updateVisibility(counselorId: number, dto: AdminVisibilityDto): Promise<CounselorResponse> {
    const counselor = await CounselorRepository.findById(counselorId);
    if (!counselor) throw httpError(404, "Counselor not found");
    await counselor.update({ isActive: dto.isActive });
    const user = await User.findByPk(counselor.userId);
    return this.formatCounselorResponse(counselor, user);
  }

  static async sendMessage(senderUserId: number, senderRole: UserRole, dto: SendMessageDto): Promise<CounselorMessageResponse> {
    const recipient = await User.findByPk(dto.recipientUserId);
    if (!recipient || !recipient.isActive) throw httpError(404, "Recipient not found");
    if (!this.isCounselorStudentPair(senderRole, recipient.role as UserRole)) {
      throw httpError(403, "Messaging is allowed only between registered counselor and student");
    }

    const linked = await this.hasBookingConnectionByUsers(senderUserId, dto.recipientUserId);
    if (!linked) throw httpError(403, "Messaging is allowed only for connected counselor-student pairs");

    const message = await CounselorMessageRepository.create({
      senderUserId,
      recipientUserId: dto.recipientUserId,
      body: dto.body.trim(),
    });
    return this.formatMessage(message);
  }

  static async getThread(requestUserId: number, requestRole: UserRole, otherUserId: number): Promise<CounselorMessageResponse[]> {
    const otherUser = await User.findByPk(otherUserId);
    if (!otherUser) throw httpError(404, "User not found");
    if (!this.isCounselorStudentPair(requestRole, otherUser.role as UserRole)) {
      throw httpError(403, "Messaging is allowed only between registered counselor and student");
    }
    const linked = await this.hasBookingConnectionByUsers(requestUserId, otherUserId);
    if (!linked) throw httpError(403, "No direct counselor-student relationship found");
    const thread = await CounselorMessageRepository.findThread(requestUserId, otherUserId);
    return thread.map((item) => this.formatMessage(item));
  }

  private static async hasBookingConnectionByUsers(userAId: number, userBId: number): Promise<boolean> {
    const [studentA, studentB, counselorA, counselorB] = await Promise.all([
      Student.findOne({ where: { userId: userAId } }),
      Student.findOne({ where: { userId: userBId } }),
      CounselorRepository.findByUserId(userAId),
      CounselorRepository.findByUserId(userBId),
    ]);

    let studentId: number | null = null;
    let counselorId: number | null = null;
    if (studentA && counselorB) {
      studentId = studentA.id;
      counselorId = counselorB.id;
    } else if (studentB && counselorA) {
      studentId = studentB.id;
      counselorId = counselorA.id;
    }
    if (!studentId || !counselorId) return false;
    const booking = await Booking.findOne({ where: { studentId, counselorId, status: { [Op.ne]: "cancelled" } } });
    return !!booking;
  }

  private static isCounselorStudentPair(roleA: UserRole, roleB: UserRole): boolean {
    return (
      (roleA === UserRole.COUNSELOR && roleB === UserRole.STUDENT) ||
      (roleA === UserRole.STUDENT && roleB === UserRole.COUNSELOR)
    );
  }

  private static parseMetadata(rawData: string | null): CounselorMetadata {
    if (!rawData) return {};
    try {
      const parsed = JSON.parse(rawData);
      return typeof parsed === "object" && parsed ? parsed : {};
    } catch {
      return {};
    }
  }

  private static hasTokenOverlap(leftText: string, rightText: string): boolean {
    if (!leftText || !rightText) return false;
    const normalizedLeft = leftText
      .split(/[^a-z0-9]+/i)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3);
    return normalizedLeft.some((token) => rightText.includes(token));
  }

  private static async findAvailableSlotsForDirectory(
    counselorIds: number[],
    fromDate?: string,
    toDate?: string,
  ): Promise<Map<number, AvailabilitySlot[]>> {
    const result = new Map<number, AvailabilitySlot[]>();
    if (counselorIds.length === 0) return result;

    const whereClause: any = {
      counselorId: { [Op.in]: counselorIds },
      status: "available",
    };

    if (fromDate || toDate) {
      whereClause.startTime = {};
      if (fromDate) whereClause.startTime[Op.gte] = new Date(fromDate);
      if (toDate) whereClause.startTime[Op.lte] = new Date(toDate);
    }

    const slots = await AvailabilitySlot.findAll({
      where: whereClause,
      order: [["startTime", "ASC"]],
    });

    for (const slot of slots) {
      const existing = result.get(slot.counselorId) || [];
      existing.push(slot);
      result.set(slot.counselorId, existing);
    }
    return result;
  }

  private static mergeMetadata(existingRaw: string | null, dto: Partial<CreateCounselorDto | UpdateCounselorDto>): CounselorMetadata {
    const existing = this.parseMetadata(existingRaw);
    return {
      qualifications: dto.qualifications ?? existing.qualifications ?? [],
      specializations: dto.specializations ?? existing.specializations ?? [],
      supportedLanguages: dto.supportedLanguages ?? existing.supportedLanguages ?? [],
      consultationModes: dto.consultationModes ?? existing.consultationModes ?? [],
      currentUniversity: dto.currentUniversity ?? existing.currentUniversity ?? "",
      currentDegreeLevel: dto.currentDegreeLevel ?? existing.currentDegreeLevel ?? "bachelors",
      availabilitySummary: dto.availabilitySummary ?? existing.availabilitySummary ?? "",
    };
  }

  private static formatCounselorResponse(counselor: Counselor, user: User | null): CounselorResponse {
    const metadata = this.parseMetadata(counselor.extractedData);
    return {
      id: counselor.id,
      userId: counselor.userId,
      name: user?.name || "Unknown User",
      email: user?.email || "N/A",
      bio: counselor.bio,
      areasOfExpertise: counselor.areasOfExpertise,
      hourlyRate: counselor.hourlyRate,
      yearsOfExperience: counselor.yearsOfExperience,
      verificationStatus: counselor.verificationStatus,
      isActive: counselor.isActive,
      rating: Number(counselor.rating || 0),
      totalSessions: counselor.totalSessions || 0,
      qualifications: metadata.qualifications || [],
      specializations: metadata.specializations || [],
      supportedLanguages: metadata.supportedLanguages || [],
      consultationModes: metadata.consultationModes || [],
      currentUniversity: metadata.currentUniversity || null,
      currentDegreeLevel: metadata.currentDegreeLevel || null,
      availabilitySummary: metadata.availabilitySummary || null,
      isOnboarded: counselor.isOnboarded,
      documentUrl: counselor.documentUrl,
      idCardUrl: counselor.idCardUrl,
      selfieUrl: counselor.selfieUrl,
      phoneNumber: counselor.phoneNumber,
      countryOfResidence: counselor.countryOfResidence,
      city: counselor.city,
      specializedCountries: counselor.specializedCountries,
      currentPosition: counselor.currentPosition,
      organization: counselor.organization,
      highestEducationLevel: counselor.highestEducationLevel,
      universityName: counselor.universityName,
      studyCountry: counselor.studyCountry,
      languages: counselor.languages,
      fieldsOfStudy: counselor.fieldsOfStudy,
      weeklySchedule: counselor.weeklySchedule,
      sessionDuration: counselor.sessionDuration,
      profileImageUrl: counselor.profileImageUrl,
      cvUrl: counselor.cvUrl,
      certificateUrls: counselor.certificateUrls,
      createdAt: counselor.createdAt,
      updatedAt: counselor.updatedAt,
    };
  }

  private static formatSlotResponse(slot: any): SlotResponse {
    return {
      id: slot.id,
      counselorId: slot.counselorId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
      reservedStudentId: slot.reservedStudentId,
      meetingLink: slot.meetingLink,
    };
  }

  private static formatBookingResponse(booking: any): any {
    const student =
      (typeof booking?.get === "function" ? booking.get("student") : null) ||
      booking?.student ||
      booking?.dataValues?.student ||
      null;

    const counselor =
      (typeof booking?.get === "function" ? booking.get("counselor") : null) ||
      booking?.counselor ||
      booking?.dataValues?.counselor ||
      null;

    const slot =
      (typeof booking?.get === "function" ? booking.get("slot") : null) ||
      booking?.slot ||
      booking?.dataValues?.slot ||
      null;

    const studentUser =
      (typeof student?.get === "function" ? student.get("user") : null) ||
      student?.user ||
      student?.dataValues?.user ||
      null;

    return {
      id: booking.id,
      studentId: booking.studentId,
      counselorId: booking.counselorId,
      slotId: booking.slotId,
      status: booking.status,
      meetingLink: booking.meetingLink,
      startedAt: booking.startedAt,
      completedAt: booking.completedAt,
      createdAt: booking.createdAt,
      student: student ? {
        id: student.id,
        userId: student.userId,
        name: studentUser?.name || "Unknown",
        email: studentUser?.email || "N/A",
      } : null,
      counselor: counselor ? {
        id: counselor.id,
        areasOfExpertise: counselor.areasOfExpertise,
        user: counselor.user ? {
          id: counselor.user.id,
          name: counselor.user.name,
          email: counselor.user.email,
          profileImageUrl: counselor.profileImageUrl
        } : null
      } : null,
      slot: slot ? {
        id: slot.id,
        counselorId: slot.counselorId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status,
        reservedStudentId: slot.reservedStudentId,
        meetingLink: slot.meetingLink,
      } : null
    };
  }

  private static formatMessage(message: any): CounselorMessageResponse {
    return {
      id: message.id,
      senderUserId: message.senderUserId,
      recipientUserId: message.recipientUserId,
      body: message.body,
      createdAt: message.createdAt,
    };
  }

  // Hook point for plugging a real scheduler/queue service.
  private static queueSessionReminder(bookingId: number, startTime: Date): void {
    const reminderAt = new Date(startTime.getTime() - 30 * 60 * 1000);
    const delayMs = reminderAt.getTime() - Date.now();
    if (delayMs <= 0) return;
    const maxDelay = 2_147_483_647;
    if (delayMs > maxDelay) {
      console.log(`[reminder] skipped booking=${bookingId}, delay too long for timer`);
      return;
    }

    setTimeout(async () => {
      try {
        const booking = await BookingRepository.findById(bookingId);
        if (!booking || !["confirmed", "started"].includes(booking.status)) return;

        const [student, counselor] = await Promise.all([
          Student.findByPk(booking.studentId),
          CounselorRepository.findById(booking.counselorId),
        ]);
        if (!student || !counselor) return;

        await Promise.all([
          NotificationService.createNotification(
            student.userId,
            "Counseling session reminder",
            "Your counseling session starts in about 30 minutes.",
            "SESSION_REMINDER",
            booking.id,
          ),
          NotificationService.createNotification(
            counselor.userId,
            "Upcoming counseling session",
            "A booked counseling session starts in about 30 minutes.",
            "SESSION_REMINDER",
            booking.id,
          ),
        ]);
      } catch (error) {
        console.error(`[reminder] failed for booking=${bookingId}`, error);
      }
    }, delayMs);
  }

  static async processPayout(counselorId: number, amount: number): Promise<any> {
    const counselor = await CounselorRepository.findById(counselorId);
    if (!counselor) throw httpError(404, "Counselor not found");
    if (amount <= 0 || Number(counselor.pendingBalance) < amount) {
        throw httpError(400, "Invalid payout amount or insufficient pending balance");
    }

    const transactionReference = `payout-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    // Here you would optimally integrate with Chapa Transfer API or similar to actually move the funds.
    // For now, we logically approve it in our system.

    const payout = await CounselorPayout.create({
        counselorId: counselor.id,
        amount,
        transactionReference,
        status: 'paid'
    });

    await counselor.update({
        pendingBalance: Number(counselor.pendingBalance) - amount
    });

    return payout;
  }

  static async getPublicProfileByUserId(userId: number): Promise<any> {
    const counselor = await CounselorRepository.findByUserId(userId);
    if (!counselor || !counselor.isActive) {
      throw httpError(404, "Counselor profile not found or inactive");
    }
    const user = await User.findByPk(userId);
    return this.formatCounselorResponse(counselor, user);
  }

  static async getStudentBookings(userId: number): Promise<any[]> {
    const student = await Student.findOne({ where: { userId } });
    if (!student) throw httpError(404, "Student profile not found");

    const bookings = await Booking.findAll({
      where: { studentId: student.id },
      include: [
        { 
          association: 'counselor', 
          include: [{ association: 'user', attributes: ['id', 'name', 'email'] }] 
        },
        { association: 'slot' }
      ],
      order: [['createdAt', 'DESC']]
    });

    return bookings.map(b => this.formatBookingResponse(b));
  }

  static async getMyPayouts(counselorId: number): Promise<any[]> {
    return CounselorPayout.findAll({
      where: { counselorId },
      order: [['createdAt', 'DESC']]
    });
  }
}