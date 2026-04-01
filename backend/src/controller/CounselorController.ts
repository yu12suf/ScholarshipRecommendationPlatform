import { Request, Response, NextFunction } from 'express';
import { CounselorService } from '../services/CounselorService.js';
import {
  AdminVerificationDto,
  AdminVisibilityDto,
  BookingStatusDto,
  CreateBookingDto,
  CreateCounselorDto,
  CreateSlotDto,
  RescheduleBookingDto,
  SendMessageDto,
  ShareDocumentDto,
  UpdateCounselorDto,
  UpdateSlotDto,
} from '../types/counselorTypes.js';

export class CounselorController {
  static async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const counselor = await CounselorService.applyAsCounselor(req.user!.id, req.body as CreateCounselorDto);
      res.status(201).json({
        success: true,
        message: 'Counselor application submitted successfully. Pending verification.',
        data: counselor,
      });
    } catch (error) {
      next(error);
    }
  }

  static async publicDirectory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.getPublicDirectory(req.query as any);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async recommendForMe(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.recommendForStudent(req.user!.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.getMyProfile(req.user!.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.getReviews((req as any).counselor.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.updateProfile(req.user!.id, req.body as UpdateCounselorDto);
      res.status(200).json({ success: true, message: 'Profile updated successfully', data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      await CounselorService.deleteProfile(req.user!.id);
      res.status(200).json({ success: true, message: 'Counselor profile deactivated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async createSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.createSlots((req as any).counselor.id, req.body.slots as CreateSlotDto[]);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.getSlots((req as any).counselor.id, req.query.fromDate as string, req.query.toDate as string, req.query.status as string);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.updateSlot((req as any).counselor.id, Number(req.params.id), req.body as UpdateSlotDto);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSlot(req: Request, res: Response, next: NextFunction) {
    try {
      await CounselorService.deleteSlot((req as any).counselor.id, Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.createBooking(req.user!.id, req.body as CreateBookingDto);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async rescheduleBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.rescheduleBooking(req.user!.id, Number(req.params.id), req.body as RescheduleBookingDto);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.cancelBooking(req.user!.id, req.user!.role, Number(req.params.id));
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.getStudents((req as any).counselor.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.getStudentProgress((req as any).counselor.id, Number(req.params.id));
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const counselor = (req as any).counselor;
      if (!counselor) {
        return res.status(200).json({
          success: true,
          data: {
            assignedStudents: 0,
            upcomingBookings: 0,
            completedSessions: 0,
            pendingBookings: 0,
          },
        });
      }
      const data = await CounselorService.getDashboardOverview(counselor.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getDashboardDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.getDashboardDocuments((req as any).counselor.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async shareDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.shareDocument((req as any).counselor.id, req.body as ShareDocumentDto);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getUpcomingBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.getUpcomingBookings((req as any).counselor.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.updateBookingStatus((req as any).counselor.id, Number(req.params.id), req.body as BookingStatusDto);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async joinSession(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.joinSession(req.user!.id, req.user!.role, Number(req.params.id));
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async adminUpdateVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.updateVerification(Number(req.params.id), req.body as AdminVerificationDto);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async adminList(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.adminList();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async adminUpdateVisibility(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.updateVisibility(Number(req.params.id), req.body as AdminVisibilityDto);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.sendMessage(req.user!.id, req.user!.role, req.body as SendMessageDto);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getThread(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CounselorService.getThread(req.user!.id, req.user!.role, Number(req.params.userId));
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
