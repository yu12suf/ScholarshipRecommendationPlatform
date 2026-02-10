import nodemailer from "nodemailer";
export class EmailService {
    static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    static async sendPasswordResetEmail(to, token) {
        const resetLink = `${process.env.BACKEND_URL}/reset-password?token=${token}`;
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
    static async sendPasswordChangedNotification(to) {
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
    static async sendAccountDeactivatedEmail(to, name) {
        const mailOptions = {
            from: process.env.SMTP_FROM || "noreply@example.com",
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
}
//# sourceMappingURL=EmailService.js.map