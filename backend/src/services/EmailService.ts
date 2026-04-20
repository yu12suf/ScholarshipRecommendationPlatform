import nodemailer from "nodemailer";
import configs from "../config/configs.js";

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: configs.SMTP_HOST,
    port: configs.SMTP_PORT,
    secure: configs.SMTP_SECURE,
    auth: {
      user: configs.SMTP_USER,
      pass: configs.SMTP_PASS,
    },
  });

  static async sendPasswordResetEmail(
    to: string,
    token: string,
  ): Promise<void> {
    const resetLink = `${configs.BACKEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: configs.SMTP_FROM,
      to,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetLink}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #dc3545;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 0;
        ">
          Reset Password
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  static async sendPasswordChangedNotification(to: string): Promise<void> {
    const mailOptions = {
      from: configs.SMTP_FROM,
      to,
      subject: "Password Changed Successfully",
      html: `
        <h2>Password Updated</h2>
        <p>Your password has been changed successfully.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p>For security reasons, you have been logged out from all devices.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  static async sendAccountDeactivatedEmail(
    to: string,
    name: string,
  ): Promise<void> {
    const mailOptions = {
      from: configs.SMTP_FROM,
      to,
      subject: "Account Deactivated",
      html: `
        <h2>Account Deactivated</h2>
        <p>Dear ${name},</p>
        <p>Your account has been deactivated by an administrator.</p>
        <p>If you believe this is a mistake, please contact our support team.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
  static async sendScholarshipMatchEmail(
    to: string,
    name: string,
    scholarship: {
      title: string;
      description: string;
      deadline: string | Date | null;
      id: number;
    },
    matchReason?: string | null
  ): Promise<void> {
    const applyLink = `${configs.FRONTEND_URL}/dashboard/student/scholarships/${scholarship.id}`;
    const deadlineStr = scholarship.deadline 
      ? new Date(scholarship.deadline).toLocaleDateString() 
      : "Not specified";

    const mailOptions = {
      from: configs.SMTP_FROM,
      to,
      subject: `Scholarship Match: ${scholarship.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #064e3b; padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">New Match Found!</h1>
          </div>
          <div style="padding: 24px;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Great news! We've found a scholarship that matches your profile perfectly:</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #0f172a;">${scholarship.title}</h3>
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;">${scholarship.description.substring(0, 200)}...</p>
              <p style="margin: 0; font-size: 14px;"><strong>Deadline:</strong> ${deadlineStr}</p>
            </div>

            ${matchReason ? `
            <div style="margin-bottom: 20px;">
              <h4 style="margin: 0 0 8px 0; color: #334155;">Why you're a match:</h4>
              <p style="margin: 0; font-size: 14px; color: #64748b; font-style: italic;">${matchReason}</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${applyLink}" style="
                display: inline-block;
                padding: 12px 30px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                text-decoration: none;
                font-weight: bold;
                border-radius: 6px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              ">
                Apply Now
              </a>
            </div>

            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              You received this email because of your notification preferences on Pathway.
              You can manage these settings in your dashboard.
            </p>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  static async sendSessionInviteEmail(params: {
    to: string;
    recipientName: string;
    counterpartName: string;
    meetingLink: string;
    startTime: Date;
    endTime: Date;
  }): Promise<void> {
    const { to, recipientName, counterpartName, meetingLink, startTime, endTime } = params;

    const startText = startTime.toLocaleString();
    const endText = endTime.toLocaleString();

    const mailOptions = {
      from: configs.SMTP_FROM,
      to,
      subject: "Counseling Session Invitation",
      html: `
        <h2>Your counseling session is confirmed</h2>
        <p>Hello ${recipientName || "there"},</p>
        <p>Your session with <strong>${counterpartName || "your session partner"}</strong> has been confirmed.</p>
        <p><strong>Start:</strong> ${startText}</p>
        <p><strong>End:</strong> ${endText}</p>
        <p><strong>Meeting link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
