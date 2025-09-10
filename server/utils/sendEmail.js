// Imports
const nodemailer = require("nodemailer");

/**
 * @desc Sends an email using Nodemailer.
 * @param {Object} options - The email options.
 * @param {string} options.to - The recipient's email address.
 * @param {string} options.subject - The subject of the email.
 * @param {string} options.text - The plain text body of the email.
 */
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: `Your App Name <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${options.to}`);
    } catch (error) {
        console.error(`Error sending email to ${options.to}:`, error);
        throw new Error("Email could not be sent.");
    }
};

module.exports = sendEmail;