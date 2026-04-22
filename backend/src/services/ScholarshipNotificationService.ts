import { Student } from "../models/Student.js";
import { User } from "../models/User.js";
import { Scholarship } from "../models/Scholarship.js";
import { Notification } from "../models/Notification.js";
import { NotificationService } from "./NotificationService.js";
import { EmailService } from "./EmailService.js";
import { MatchedScholarship } from "../types/scholarshipTypes.js";

export class ScholarshipNotificationService {
  /**
   * Notifies a student about a scholarship match if they haven't been notified yet.
   */
  static async notifyMatch(
    user: User,
    student: Student,
    scholarship: MatchedScholarship
  ): Promise<void> {
    try {
      // 1. Check for existing notification to avoid duplicates
      const existing = await Notification.findOne({
        where: {
          userId: user.id,
          type: 'SCHOLARSHIP_MATCH',
          relatedId: scholarship.id
        }
      });

      if (existing) {
        // Already notified about this scholarship match
        return;
      }

      // 2. Parse User Preferences
      const prefs = this.parsePreferences(student.notificationPreferences);
      
      const title = `Scholarship Match: ${scholarship.title}`;
      const message = `We've found a new scholarship that matches your profile! Click to view details and apply.`;

      // 3. Send In-App Notification
      if (prefs.inSystem) {
        await NotificationService.createNotification(
          user.id,
          title,
          message,
          'SCHOLARSHIP_MATCH',
          scholarship.id
        );
        console.log(`[ScholarshipNotification] In-app notification sent to user ${user.id} for scholarship ${scholarship.id}`);
      }

      // 4. Send Email Notification
      if (prefs.email) {
        await EmailService.sendScholarshipMatchEmail(
          user.email,
          user.name,
          {
            id: scholarship.id,
            title: scholarship.title,
            description: scholarship.description || "",
            deadline: scholarship.deadline || null
          },
          scholarship.matchReason
        );
        console.log(`[ScholarshipNotification] Email notification sent to ${user.email} for scholarship ${scholarship.id}`);
      }
    } catch (error) {
      console.error(`[ScholarshipNotification] Error notifying match for user ${user.id}:`, error);
    }
  }

  /**
   * Batch notify for multiple matches (e.g., after initial onboarding)
   */
  static async notifyMultipleMatches(
    user: User,
    student: Student,
    matches: MatchedScholarship[]
  ): Promise<void> {
    // For batch matches, we might want to send one summary or a few top ones
    // Requirement says "immediately after a match is detected"
    // To avoid spamming, we notify only the top 3 best new matches if it's a batch
    const topNewMatches = matches.slice(0, 3);
    
    for (const match of topNewMatches) {
      await this.notifyMatch(user, student, match);
    }
  }

  private static parsePreferences(prefsStr: string | null): { email: boolean; inSystem: boolean } {
    const defaults = { email: true, inSystem: true };
    if (!prefsStr) return defaults;
    
    try {
      const parsed = typeof prefsStr === 'string' ? JSON.parse(prefsStr) : prefsStr;
      return {
        email: parsed.email !== undefined ? !!parsed.email : defaults.email,
        inSystem: parsed.inSystem !== undefined ? !!parsed.inSystem : defaults.inSystem
      };
    } catch (e) {
      return defaults;
    }
  }
}
