export const sendEmail = async (options: { to: string; subject: string; text: string }) => {
    console.log(`[Email Mock] Sending email to ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Text: ${options.text}`);
    // Implement actual email sending logic here (e.g. using nodemailer)
    return Promise.resolve();
};
