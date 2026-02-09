import nodemailer from "nodemailer";

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@example.com",
      to,
      subject: "Verify Your Email Address",
      html: `
        <h2>Welcome to Our Platform!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 0;
        ">
          Verify Email
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  static async sendPasswordResetEmail(
    to: string,
    token: string,
  ): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@example.com",
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
      from: process.env.SMTP_FROM || "noreply@example.com",
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

  static async sendWelcomeEmail(to: string, username: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@example.com",
      to,
      subject: "Welcome to Our Platform!",
      html: `
        <h2>Welcome ${username}!</h2>
        <p>Thank you for verifying your email address.</p>
        <p>Your account is now fully activated and ready to use.</p>
        <p>If you have any questions, feel free to contact our support team.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  static async sendAccountDeactivatedEmail(
    to: string,
    username: string,
  ): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_FROM || "noreply@example.com",
      to,
      subject: "Account Deactivated",
      html: `
        <h2>Account Deactivated</h2>
        <p>Dear ${username},</p>
        <p>Your account has been deactivated by an administrator.</p>
        <p>If you believe this is a mistake, please contact our support team.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
