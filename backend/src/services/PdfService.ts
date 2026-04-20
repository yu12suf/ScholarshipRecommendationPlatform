import { PdfRepository } from "../repositories/PdfRepository.js";
import { Pdf } from "../models/Pdf.js";

export class PdfService {
    static async create(data: any): Promise<Pdf> {
        return PdfRepository.create(data);
    }

    static async getAll(): Promise<Pdf[]> {
        return PdfRepository.findAll();
    }

    static async getById(id: number): Promise<Pdf | null> {
        return PdfRepository.findById(id);
    }

    static async getFivePerType(level: string, examType: string = 'IELTS'): Promise<{ [key: string]: Pdf[] }> {
        return PdfRepository.findFivePerType(level, examType);
    }
}
