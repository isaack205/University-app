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

    // Verify SMTP connection and credentials before attempting to send.
    // This surfaces the real error code (535 Auth Failed, ECONNREFUSED, etc.)
    // immediately instead of burying it under a generic message.
    try {
        await transporter.verify();
    } catch (verifyError) {
        console.error(`[Email] SMTP connection/auth failed:`, {
            code: verifyError.code,
            command: verifyError.command,
            message: verifyError.message,
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            user: process.env.EMAIL_USERNAME,
        });
        throw new Error(`SMTP verification failed: ${verifyError.message}`);
    }

    const mailOptions = {
        from: `Campus Hub <${process.env.EMAIL_FROM}>`,
        to: options.to,
        bcc: options.bcc,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email] ✅ Sent to ${options.to}`);
    } catch (error) {
        console.error(`[Email] ❌ Failed to send to ${options.to}:`, {
            code: error.code,
            command: error.command,
            message: error.message,
        });
        // Re-throw the real error so the caller gets the actual reason, not a generic string
        throw error;
    }
};

module.exports = sendEmail;

// // Imports
// const FormData = require("form-data");
// const Mailgun = require("mailgun.js");

// /**
//  * @desc Sends an email using Mailgun.
//  * @param {Object} options - The email options.
//  * @param {string} options.to - The recipient's email address.
//  * @param {string} options.subject - The subject of the email.
//  * @param {string} options.text - The plain text body of the email.
//  */
// const sendEmail = async (options) => {
//     const mailgun = new Mailgun(FormData);
//     const mg = mailgun.client({
//         username: "api",
//         key: process.env.MAILGUN_API_KEY,
//     });

//     const mailOptions = {
//         from: `Campus Hub <${process.env.EMAIL_FROM}>`,
//         to: options.to,
//         subject: options.subject,
//         text: options.text,
//     };

//     try {
//         const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, mailOptions);
//         console.log(`✅ Email queued to ${options.to}`, response);
//     } catch (error) {
//         console.error(`❌ Error sending email to ${options.to}:`, error);
//         throw new Error("Email could not be sent.");
//     }
// };

// module.exports = sendEmail;