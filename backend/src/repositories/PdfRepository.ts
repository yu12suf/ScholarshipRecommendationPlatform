import { Pdf } from "../models/Pdf.js";

export class PdfRepository {
    static async create(data: any): Promise<Pdf> {
        return Pdf.create(data);
    }

    static async findAll(): Promise<Pdf[]> {
        return Pdf.findAll();
    }

    static async findById(id: number): Promise<Pdf | null> {
        return Pdf.findByPk(id);
    }

    static async update(id: number, data: any): Promise<[number, Pdf[]]> {
        return Pdf.update(data, {
            where: { id },
            returning: true
        });
    }

    static async delete(id: number): Promise<number> {
        return Pdf.destroy({
            where: { id }
        });
    }

    static async findFivePerType(level: string, examType: string = 'IELTS'): Promise<{ [key: string]: Pdf[] }> {
        const types = ['Reading', 'Listening', 'Writing', 'Speaking'];
        const result: { [key: string]: Pdf[] } = {};

        for (const type of types) {
            const pdfs = await Pdf.findAll({
                where: {
                    level,
                    type,
                    examType
                },
                limit: 5
            });
            result[type.toLowerCase()] = pdfs;
        }

        return result;
    }
}
