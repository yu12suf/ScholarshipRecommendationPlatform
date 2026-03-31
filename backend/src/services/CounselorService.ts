import { Op } from "sequelize";
import { Counselor } from "../models/Counselor.js";
import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { Booking } from "../models/Booking.js";
import { UserRole } from "../types/userTypes.js";
import { AvailabilitySlotRepository } from "../repositories/AvailabilitySlotRepository.js";
import { BookingRepository } from "../repositories/BookingRepository.js";
import { CounselorRepository } from "../repositories/CounselorRepository.js";
import { CounselorReviewRepository } from "../repositories/CounselorReviewRepository.js";
import { DocumentRepository } from "../repositories/DocumentRepository.js";
import { CounselorMessageRepository } from "../repositories/CounselorMessageRepository.js";
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
  static async applyAsCounselor(userId: number, dto: CreateCounselorDto): Promise<CounselorResponse> {
    const existingCounselor = await CounselorRepository.findByUserId(userId);
    if (existingCounselor) {
      throw httpError(409, "User already has a counselor profile");
    }

    const counselor = await CounselorRepository.create({
      userId,
      bio: dto.bio || "",
      areasOfExpertise: dto.areasOfExpertise || dto.specializations?.join(", ") || "",
      hourlyRate: dto.hourlyRate,
      yearsOfExperience: dto.yearsOfExperience,
      verificationStatus: "pending",
      isActive: true,
      extractedData: JSON.stringify(this.mergeMetadata(null, dto)),
    });

    const user = await User.findByPk(userId);
    return this.formatCounselorResponse(counselor, user);
  }

  static async getMyProfile(userId: number): Promise<CounselorResponse> {
    const counselor = await CounselorRepository.findByUserId(userId);
    if (!counselor) {
      throw httpError(404, "Counselor profile not found");
    }
    const user = await User.findByPk(userId);
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

    const payload = filteredRows.map((c) => this.formatCounselorResponse(c, (c as any).user || null));
    return { rows: payload, count, page, limit };
  }

  static async recommendForStudent(userId: number): Promise<CounselorRecommendationResponse[]> {
    const student = await Student.findOne({ where: { userId } });
    if (!student) throw httpError(404, "Student profile not found");

    const studentPreferences = (student.studyPreferences || "").toLowerCase();
    const candidates = await Counselor.findAll({
      where: { verificationStatus: "verified", isActive: true },
      include: [{ model: User, as: "user", attributes: ["name", "email"] }],
      order: [["rating", "DESC"]],
    });

    return candidates
      .map((counselor) => {
        const metadata = this.parseMetadata(counselor.extractedData);
        let recommendationScore = Number(counselor.rating || 0);
        if ((counselor.areasOfExpertise || "").toLowerCase().includes(studentPreferences)) recommendationScore += 2;
        if (metadata.currentUniversity && studentPreferences.includes(metadata.currentUniversity.toLowerCase())) recommendationScore += 2;
        const base = this.formatCounselorResponse(counselor, (counselor as any).user || null);
        return { ...base, recommendationScore };
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

  static async updateProfile(userId: number, dto: UpdateCounselorDto): Promise<CounselorResponse> {
    const counselor = await CounselorRepository.findByUserId(userId);
    if (!counselor) throw httpError(404, "Counselor profile not found");

    await counselor.update({
      bio: dto.bio ?? counselor.bio,
      areasOfExpertise: dto.areasOfExpertise ?? dto.specializations?.join(", ") ?? counselor.areasOfExpertise,
      hourlyRate: dto.hourlyRate ?? counselor.hourlyRate,
      yearsOfExperience: dto.yearsOfExperience ?? counselor.yearsOfExperience,
      extractedData: JSON.stringify(this.mergeMetadata(counselor.extractedData, dto)),
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
    const now = new Date();

    for (const slot of slots) {
      const start = new Date(slot.startTime);
      const end = new Date(slot.endTime);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        throw httpError(400, "Invalid slot time range");
      }
      if (start < now) throw httpError(400, "Cannot create slot in the past");
      const overlap = await AvailabilitySlotRepository.findOverlappingSlots(counselorId, start, end);
      if (overlap) throw httpError(409, "Slot overlaps with existing slot");
    }

    const created = await AvailabilitySlotRepository.bulkCreate(
      slots.map((slot) => ({
        counselorId,
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime),
      })),
    );
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

  static async createBooking(userId: number, dto: CreateBookingDto): Promise<BookingResponse> {
    const student = await Student.findOne({ where: { userId } });
    if (!student) throw httpError(404, "Student profile not found");
    const slot = await AvailabilitySlotRepository.findById(dto.slotId);
    if (!slot || slot.status !== "available") throw httpError(409, "Slot is not available");
    const counselor = await CounselorRepository.findById(slot.counselorId);
    if (!counselor || counselor.verificationStatus !== "verified" || !counselor.isActive) {
      throw httpError(403, "Counselor is not available for booking");
    }

    const meetingLink = slot.meetingLink || `https://meet.edu-pathway.com/session-${slot.id}`;
    const booking = await BookingRepository.create({
      studentId: student.id,
      counselorId: slot.counselorId,
      slotId: slot.id,
      status: "confirmed",
      meetingLink,
    });
    this.queueSessionReminder(booking.id, slot.startTime);
    await AvailabilitySlotRepository.update(slot.id, {
      status: "booked",
      reservedStudentId: student.id,
      meetingLink,
    });
    return this.formatBookingResponse(booking);
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
      if (!uniqueStudents.has(booking.studentId)) {
        uniqueStudents.set(booking.studentId, {
          studentId: booking.student.id,
          userId: booking.student.userId,
          name: (booking as any).student?.user?.name || "Unknown",
          email: (booking as any).student?.user?.email || "Unknown",
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
    return {
      studentId: student.id,
      name: (student as any).user?.name || "Unknown",
      email: (student as any).user?.email || "Unknown",
      learningPath: null,
      recentAssessments: [],
      trackedScholarships: [],
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
    const bookings = await BookingRepository.findUpcomingByCounselor(counselorId, true);
    return bookings
      .filter((booking) => {
        const start = (booking as any).slot?.startTime;
        return start && new Date(start) > now;
      })
      .map((booking) => this.formatBookingResponse(booking));
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
      if (counselor) await counselor.update({ totalSessions: (counselor.totalSessions || 0) + 1 });
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
    const slot = (booking as any).slot;
    if (!slot) throw httpError(404, "Slot not found");
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    if ((start.getTime() - now.getTime()) / 60000 > 10) throw httpError(403, "Meeting link is only available 10 minutes before the start time");
    if (now > end) throw httpError(409, "This session has already ended");

    const meetingLink = booking.meetingLink || slot.meetingLink || `https://meet.edu-pathway.com/session-${booking.id}`;
    if (booking.status === "confirmed") await booking.update({ status: "started", startedAt: now, meetingLink });
    return { meetingLink };
  }

  static async updateVerification(counselorId: number, dto: AdminVerificationDto): Promise<CounselorResponse> {
    const counselor = await CounselorRepository.findById(counselorId);
    if (!counselor) throw httpError(404, "Counselor not found");
    await counselor.update({ verificationStatus: dto.verificationStatus });
    const user = await User.findByPk(counselor.userId);
    return this.formatCounselorResponse(counselor, user);
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
    if (!user) throw httpError(404, "User not found for counselor");
    const metadata = this.parseMetadata(counselor.extractedData);
    return {
      id: counselor.id,
      userId: counselor.userId,
      name: user.name,
      email: user.email,
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

  private static formatBookingResponse(booking: Booking): BookingResponse {
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
    console.log(`[reminder] schedule booking=${bookingId} reminderAt=${reminderAt.toISOString()}`);
  }
}