// Imports
const Feedback = require('../models/feedback');
const sendEmail = require('../utils/sendEmail');

exports.submitFeedback = async (req, res) => {
    try {
        const { type, message, guestName, guestEmail } = req.body;
        
        const feedbackData = {
            type: type || 'other',
            message
        };

        if (req.user && req.user.id) {
            feedbackData.user = req.user.id;
        } else {
            feedbackData.guestName = guestName;
            feedbackData.guestEmail = guestEmail;
        }

        const feedback = await Feedback.create(feedbackData);
        res.status(201).json({ message: 'Feedback submitted', feedback });
    } catch (err) {
        res.status(500).json({ message: 'Failed to submit feedback', error: err.message });
    }
};

exports.getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch feedback', error: err.message });
    }
};

exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { status, adminNote, sendEmail: shouldSendEmail, replyMessage } = req.body;
        const updateData = { status };
        
        if (adminNote !== undefined) {
            updateData.adminNote = adminNote;
        }
        
        if (status === 'resolved') {
            updateData.resolvedAt = Date.now();
        }

        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('user', 'name email');

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        // Send email if requested
        if (shouldSendEmail && replyMessage) {
            const recipientEmail = feedback.user ? feedback.user.email : feedback.guestEmail;
            const recipientName = feedback.user ? feedback.user.name : (feedback.guestName || 'Guest');
            
            if (recipientEmail) {
                await sendEmail({
                    to: recipientEmail,
                    subject: 'Update on your Feedback - CampusHub',
                    text: `Hello ${recipientName},\n\nAn admin has replied to your recent feedback/issue:\n\n"${replyMessage}"\n\nCurrent Status: ${status.toUpperCase()}\n\nBest regards,\nCampusHub Admin Team`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Hello ${recipientName},</h2>
                            <p>An admin has replied to your recent feedback/issue.</p>
                            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0;">
                                <p style="margin: 0; white-space: pre-wrap;">${replyMessage}</p>
                            </div>
                            <p><strong>Current Status:</strong> ${status.toUpperCase()}</p>
                            <br/>
                            <p>Best regards,<br/>CampusHub Admin Team</p>
                        </div>
                    `
                });
            }
        }

        res.status(200).json({ message: 'Feedback updated', feedback });
    } catch (err) {
        console.error("Error updating feedback:", err);
        res.status(500).json({ message: 'Failed to update feedback', error: err.message });
    }
};
