import { Op } from 'sequelize';
import Booking from '../models/Booking.js';
import { CounselorService } from '../services/CounselorService.js';
import sequelize from '../config/sequelize.js';

export class SettlementService {
    /**
     * Automatically releases funds for bookings that were completed more than 7 days ago
     * but haven't been confirmed or disputed by the student.
     */
    static async autoReleaseEscrow() {
        console.log('[SettlementService] Starting auto-release of escrowed funds...');
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        try {
            // Find bookings that are 'completed' (session happened) 
            // but still 'held' (funds not released)
            // and the session date is older than 7 days
            const stagnantBookings = await Booking.findAll({
                where: {
                    status: 'completed',
                    paymentStatus: 'held',
                    appointmentDate: {
                        [Op.lt]: sevenDaysAgo
                    }
                }
            });

            console.log(`[SettlementService] Found ${stagnantBookings.length} bookings for auto-release.`);

            for (const booking of stagnantBookings) {
                try {
                    await sequelize.transaction(async (t) => {
                        console.log(`[SettlementService] Processing auto-release for Booking #${booking.id}`);
                        
                        // We reuse the logic from CounselorService to ensure consistency in ledger updates
                        await CounselorService.reviewAndConfirmBooking(
                            booking.id,
                            5, // Default 5 star rating for auto-release
                            "Automatically released after 7 days of inactivity.",
                            t
                        );
                    });
                } catch (innerError) {
                    console.error(`[SettlementService] Failed to auto-release Booking #${booking.id}:`, innerError);
                }
            }

            return stagnantBookings.length;
        } catch (error) {
            console.error('[SettlementService] Error during auto-release cron:', error);
            throw error;
        }
    }
}
