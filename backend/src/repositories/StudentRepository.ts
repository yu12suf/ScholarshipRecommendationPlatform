import { Student } from "../models/Student.js";

export class StudentRepository {
    static async findByUserId(userId: number): Promise<Student | null> {
        return Student.findOne({ where: { userId } });
    }

    static async create(data: any): Promise<Student> {
        return Student.create(data);
    }

    static async update(userId: number, updates: any): Promise<Student | null> {
        const student = await this.findByUserId(userId);
        if (!student) return null;
        return student.update(updates);
    }
}
