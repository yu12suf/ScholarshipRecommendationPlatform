import nodemailer from "nodemailer";
import configs from "../config/configs.js";

export const sendEmail = async (options: { to: string; subject: string; text: string }) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: configs.SMTP_HOST,
        port: configs.SMTP_PORT,
        secure: configs.SMTP_SECURE, // true for 465, false for other ports
        auth: {
            user: configs.SMTP_USER,
            pass: configs.SMTP_PASS,
        },
    });

    // Define email options
    const mailOptions = {
        from: configs.SMTP_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text,
        // you can also add html: options.html if you want to send html emails
    };

    // Send email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email could not be sent");
    }
};
