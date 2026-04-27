import { CreateOptions, Op } from 'sequelize';
import { CounselorReview } from '../models/CounselorReview.js';
import { Order } from 'sequelize';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';

export class CounselorReviewRepository {
    /**
     * Find a review by ID
     */
    static async findById(id: number): Promise<CounselorReview | null> {
        return CounselorReview.findByPk(id);
    }

    /**
     * Find a review by booking ID
     */
    static async findByBookingId(bookingId: number): Promise<CounselorReview | null> {
        return CounselorReview.findOne({
            where: { bookingId }
        });
    }

    /**
     * Find all reviews for a counselor
     */
    static async findAllByCounselor(
        counselorId: number,
        options?: {
            limit?: number;
            offset?: number;
            order?: Order;
        }
    ): Promise<CounselorReview[]> {
        const queryOptions: any = {
            where: { counselorId },
            include: [
                {
                    model: Student,
                    as: 'student',
                    required: false,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['name', 'email']
                        }
                    ]
                }
            ],
            order: options?.order || [['createdAt', 'DESC']] as Order
        };

        if (options?.limit !== undefined) {
            queryOptions.limit = options.limit;
        }
        if (options?.offset !== undefined) {
            queryOptions.offset = options.offset;
        }

        return CounselorReview.findAll(queryOptions);
    }

    /**
     * Find all reviews by a student
     */
    static async findAllByStudent(studentId: number): Promise<CounselorReview[]> {
        return CounselorReview.findAll({
            where: { studentId },
            order: [['createdAt', 'DESC']] as Order
        });
    }

    /**
     * Create a new review
     */
    static async create(data: {
        bookingId: number;
        studentId: number;
        counselorId: number;
        rating: number;
        comment?: string;
    }, options?: CreateOptions): Promise<CounselorReview> {
        return CounselorReview.create({
            bookingId: data.bookingId,
            studentId: data.studentId,
            counselorId: data.counselorId,
            rating: data.rating,
            comment: data.comment || null
        }, options);
    }

    /**
     * Update a review
     */
    static async update(
        id: number,
        data: {
            rating?: number;
            comment?: string;
        }
    ): Promise<CounselorReview | null> {
        const review = await CounselorReview.findByPk(id);
        if (!review) return null;
        return review.update(data);
    }

    /**
     * Delete a review
     */
    static async delete(id: number): Promise<boolean> {
        const review = await CounselorReview.findByPk(id);
        if (!review) return false;
        await review.destroy();
        return true;
    }

    /**
     * Find review by ID and counselor ID (ownership check)
     */
    static async findByIdAndCounselorId(
        id: number,
        counselorId: number
    ): Promise<CounselorReview | null> {
        return CounselorReview.findOne({
            where: {
                id,
                counselorId
            }
        });
    }

    /**
     * Count reviews by counselor
     */
    static async countByCounselor(counselorId: number): Promise<number> {
        return CounselorReview.count({
            where: { counselorId }
        });
    }

    /**
     * Calculate average rating for a counselor
     */
    static async getAverageRating(counselorId: number): Promise<number> {
        const reviews = await CounselorReview.findAll({
            where: { counselorId },
            attributes: ['rating']
        });

        if (reviews.length === 0) {
            return 0;
        }

        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / reviews.length;
    }

    /**
     * Get rating distribution for a counselor
     */
    static async getRatingDistribution(counselorId: number): Promise<{
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    }> {
        const reviews = await CounselorReview.findAll({
            where: { counselorId },
            attributes: ['rating']
        });

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            if (review.rating >= 1 && review.rating <= 5) {
                distribution[review.rating as keyof typeof distribution]++;
            }
        });

        return distribution;
    }

    /**
     * Get review statistics for a counselor
     */
    static async getStatistics(counselorId: number): Promise<{
        totalReviews: number;
        averageRating: number;
        ratingDistribution: {
            1: number;
            2: number;
            3: number;
            4: number;
            5: number;
        };
    }> {
        const totalReviews = await this.countByCounselor(counselorId);
        const averageRating = await this.getAverageRating(counselorId);
        const ratingDistribution = await this.getRatingDistribution(counselorId);

        return {
            totalReviews,
            averageRating: Number(averageRating.toFixed(2)),
            ratingDistribution
        };
    }
}
