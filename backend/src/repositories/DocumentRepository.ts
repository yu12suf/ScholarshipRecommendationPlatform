import { Order } from "sequelize";
import { Document } from "../models/Document.js";

export class DocumentRepository {
  static async create(data: {
    studentId: number;
    counselorId: number | null;
    documentType: "sop" | "cv" | "lor" | "transcript" | "other";
    fileUrl?: string;
    counselorFeedback?: string;
  }): Promise<Document> {
    return Document.create({
      studentId: data.studentId,
      counselorId: data.counselorId,
      documentType: data.documentType,
      fileUrl: data.fileUrl || null,
      counselorFeedback: data.counselorFeedback || null,
    });
  }

  static async findAllByCounselor(counselorId: number): Promise<Document[]> {
    return Document.findAll({
      where: { counselorId },
      order: [["createdAt", "DESC"]] as Order,
    });
  }
}
