import { User } from "./User.js";
import { RefreshToken } from "./RefreshToken.js";
import { PasswordResetToken } from "./PasswordResetToken.js";
import { Student } from "./Student.js";
import { Counselor } from "./Counselor.js";
import { AvailabilitySlot } from "./AvailabilitySlot.js";
import { Booking } from "./Booking.js";
import { CounselorReview } from "./CounselorReview.js";
import { Document } from "./Document.js";
import { CounselorMessage } from "./CounselorMessage.js";
import { ScholarshipSource } from "./ScholarshipSource.js";
import { Scholarship } from "./Scholarship.js";
import { AssessmentResult } from "./AssessmentResult.js";
import { Consultation } from "./Consultation.js";
import { Notification } from "./Notification.js";
import { Video } from "./Video.js";
import { LearningPath } from "./LearningPath.js";
import { LearningPathProgress } from "./LearningPathProgress.js";
import { Conversation } from "./Conversation.js";
import { ConversationParticipant } from "./ConversationParticipant.js";
import { ChatMessage } from "./ChatMessage.js";
import { TrackedScholarship } from "./TrackedScholarship.js";
import { ScholarshipMilestone } from "./ScholarshipMilestone.js";
import { CommunityGroup } from "./CommunityGroup.js";
import { CommunityMember } from "./CommunityMember.js";
import { CommunityMessage } from "./CommunityMessage.js";
import { CommunityMessageReaction } from "./CommunityMessageReaction.js";

export function initAssociations() {
    User.hasMany(RefreshToken, { foreignKey: 'userId' });
    RefreshToken.belongsTo(User, { foreignKey: 'userId' });

    User.hasMany(PasswordResetToken, { foreignKey: 'userId' });
    PasswordResetToken.belongsTo(User, { foreignKey: 'userId' });

    Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    User.hasOne(Student, { foreignKey: 'userId' });

    Counselor.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    User.hasOne(Counselor, { foreignKey: 'userId' });
    User.hasMany(Counselor, { foreignKey: 'userId', as: 'counselors' });
    Counselor.hasMany(AvailabilitySlot, { foreignKey: 'counselorId' });
    Counselor.hasMany(Booking, { foreignKey: 'counselorId' });
    Counselor.hasMany(CounselorReview, { foreignKey: 'counselorId' });
    AvailabilitySlot.belongsTo(Counselor, { foreignKey: 'counselorId' });

    Student.hasMany(Booking, { foreignKey: 'studentId', as: 'bookings' });
    Booking.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
    Booking.belongsTo(Counselor, { foreignKey: 'counselorId', as: 'counselor' });
    Booking.belongsTo(AvailabilitySlot, { foreignKey: 'slotId', as: 'slot' });
    Counselor.hasMany(Booking, { foreignKey: 'counselorId' });

    Student.hasMany(CounselorReview, { foreignKey: 'studentId' });
    Counselor.hasMany(CounselorReview, { foreignKey: 'counselorId' });
    CounselorReview.belongsTo(Student, { foreignKey: 'studentId' });
    CounselorReview.belongsTo(Counselor, { foreignKey: 'counselorId' });

    Student.hasMany(Document, { foreignKey: 'studentId' });
    Counselor.hasMany(Document, { foreignKey: 'counselorId' });
    Document.belongsTo(Student, { foreignKey: 'studentId' });
    Document.belongsTo(Counselor, { foreignKey: 'counselorId' });

    User.hasMany(CounselorMessage, { foreignKey: 'senderUserId', as: 'sentMessages' });
    User.hasMany(CounselorMessage, { foreignKey: 'recipientUserId', as: 'receivedMessages' });
    CounselorMessage.belongsTo(User, { foreignKey: 'senderUserId', as: 'sender' });
    CounselorMessage.belongsTo(User, { foreignKey: 'recipientUserId', as: 'recipient' });

    ScholarshipSource.hasMany(Scholarship, { foreignKey: 'sourceId' });
    Scholarship.belongsTo(ScholarshipSource, { foreignKey: 'sourceId' });

    Student.hasMany(AssessmentResult, { foreignKey: 'studentId' });
    AssessmentResult.belongsTo(Student, { foreignKey: 'studentId' });

    User.hasMany(Consultation, { foreignKey: 'studentId', as: 'consultationsAsStudent' });
    User.hasMany(Consultation, { foreignKey: 'counselorUserId', as: 'consultationsAsCounselor' });
    Consultation.belongsTo(User, { foreignKey: 'studentId' });
    Consultation.belongsTo(User, { foreignKey: 'counselorUserId' });

    User.hasMany(Notification, { foreignKey: 'userId' });
    Notification.belongsTo(User, { foreignKey: 'userId' });

    Student.hasMany(LearningPath, { foreignKey: 'studentId' });
    LearningPath.belongsTo(Student, { foreignKey: 'studentId' });

    Student.hasMany(LearningPathProgress, { foreignKey: 'studentId' });
    Video.hasMany(LearningPathProgress, { foreignKey: 'videoId' });
    LearningPathProgress.belongsTo(Student, { foreignKey: 'studentId' });
    LearningPathProgress.belongsTo(Video, { foreignKey: 'videoId' });

    Conversation.hasMany(ChatMessage, { foreignKey: 'conversationId', as: 'messages' });
    Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversationId', as: 'conversationParticipants' });
    ChatMessage.belongsTo(Conversation, { foreignKey: 'conversationId' });
    ChatMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
    User.hasMany(ChatMessage, { foreignKey: 'senderId' });

    ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversationId' });
    ConversationParticipant.belongsTo(User, { foreignKey: 'userId' });
    Conversation.belongsToMany(User, { through: ConversationParticipant, foreignKey: 'conversationId', as: 'users' });

    Student.hasMany(TrackedScholarship, { foreignKey: 'studentId' });
    TrackedScholarship.belongsTo(Student, { foreignKey: 'studentId' });
    TrackedScholarship.belongsTo(Scholarship, { foreignKey: 'scholarshipId' });
    Scholarship.hasMany(TrackedScholarship, { foreignKey: 'scholarshipId' });
    TrackedScholarship.hasMany(ScholarshipMilestone, { foreignKey: 'trackedScholarshipId' });
    ScholarshipMilestone.belongsTo(TrackedScholarship, { foreignKey: 'trackedScholarshipId' });

    CommunityGroup.belongsTo(User, { foreignKey: 'createdBy' });
    User.hasMany(CommunityGroup, { foreignKey: 'createdBy' });
    CommunityGroup.hasMany(CommunityMember, { foreignKey: 'groupId' });
    CommunityGroup.hasMany(CommunityMessage, { foreignKey: 'groupId' });
    CommunityMember.belongsTo(CommunityGroup, { foreignKey: 'groupId' });
    CommunityMember.belongsTo(User, { foreignKey: 'userId' });
    CommunityMessage.belongsTo(CommunityGroup, { foreignKey: 'groupId' });
    CommunityMessage.belongsTo(User, { foreignKey: 'senderId' });
    CommunityMessageReaction.belongsTo(CommunityMessage, { foreignKey: 'messageId' });
    CommunityMessageReaction.belongsTo(User, { foreignKey: 'userId' });

    console.log('[Associations] All associations initialized');
}