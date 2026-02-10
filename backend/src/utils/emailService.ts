import nodemailer from "nodemailer";

export const sendEmail = async (options: { to: string; subject: string; text: string }) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Define email options
    const mailOptions = {
        from: process.env.SMTP_FROM || `"Educational Pathway" <noreply@edu-pathway.com>`,
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
